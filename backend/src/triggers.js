import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import { ClaimWireCCAdapter } from './claimwire.js';
import { Policy, Claim } from './models.js';
import { sendWhatsAppNotification } from './twilioService.js';

dotenv.config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const AQI_API_KEY = process.env.AQI_API_KEY;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export function startTriggerEngine() {
    console.log("[⚙️] Starting Parametric Trigger Engine (Checking every 10 mins)...");

    cron.schedule('*/1 * * * *', async () => {
        try {
            console.log("\n[🌡] Polling Weather & AQI for disruptions...");
            
            // Real API Polling Logic
            let weatherData = { rain_mm: 0 };
            try {
                if (OPENWEATHER_API_KEY) {
                    const url = `https://api.openweathermap.org/data/2.5/weather?q=Mumbai&appid=${OPENWEATHER_API_KEY}&units=metric`;
                    const res = await axios.get(url);
                    // Extract rain if available (last 1h or 3h)
                    weatherData.rain_mm = res.data.rain ? (res.data.rain['1h'] || res.data.rain['3h'] || 0) : 0;
                } else {
                    console.warn("[⚠️] OPENWEATHER_API_KEY missing. Using simulated weather.");
                    weatherData.rain_mm = 55.0; // Simulated trigger for demo
                }
            } catch (err) {
                console.error("Weather API Error:", err.message);
                weatherData.rain_mm = 0;
            }

            const mockAQI = { aqi: 150 }; 

            let triggerEvent = null;
            if (weatherData.rain_mm > 50) {
                triggerEvent = { type: 'SEVERE_RAIN', value: weatherData.rain_mm, zone: 'Andheri' };
            } else if (mockAQI.aqi > 300) {
                triggerEvent = { type: 'SEVERE_SMOG', value: mockAQI.aqi, zone: 'Andheri' };
            }

            if (triggerEvent) {
                console.log(`[🚨] ALERT! Trigger Activated: ${triggerEvent.type} in ${triggerEvent.zone}`);
                await processAutomatedClaims(triggerEvent);
            } else {
                console.log("[✅] All zones clear. No disruptions.");
            }

        } catch (error) {
            console.error("Trigger Engine Error:", error.message);
        }
    });
}

export async function processAutomatedClaims(triggerEvent) {
    const impacted = await Policy.find({ zone: triggerEvent.zone, status: 'ACTIVE' });
    console.log(`[🔎] Found ${impacted.length} active policies in ${triggerEvent.zone}`);

    for (const policy of impacted) {
        // Advanced Fraud Check Payload
        const fraudReq = {
            partner_id: policy.partner_id,
            zone: policy.zone,
            distance_from_home_km: 1.2, 
            travel_time_minutes: 30,
            claimed_at: new Date().toISOString(),
            trigger_type: triggerEvent.type
        };

        try {
            const fraudRes = await axios.post(`${ML_SERVICE_URL}/api/ml/fraud-score`, fraudReq);
            const { is_anomaly, reasons } = fraudRes.data;

            if (is_anomaly) {
                console.log(`[⚠️] Fraud Flagged for ${policy.partner_id}: ${reasons.join(', ')}`);
                
                // Save flag to DB
                await new Claim({
                    claimNumber: `FLAG-${Math.floor(Math.random()*10000)}`,
                    policyNumber: policy.policyNumber,
                    partner_id: policy.partner_id,
                    amount: 0,
                    triggerType: triggerEvent.type,
                    zone: triggerEvent.zone,
                    status: 'FLAGGED'
                }).save();
                continue; 
            }

            const fnol = await ClaimWireCCAdapter.createFNOL(policy.policyNumber, triggerEvent);
            const gwClaim = await ClaimWireCCAdapter.approveAndPayClaim(fnol.claimNumber);

            // Phase 3: Enhanced Payout Simulation
            const payoutResult = await mockUPIPayout(policy.partner_id, fnol.estimatedLossAmount);

            const newClaim = new Claim({
                claimNumber: fnol.claimNumber,
                policyNumber: policy.policyNumber,
                partner_id: policy.partner_id,
                amount: fnol.estimatedLossAmount,
                triggerType: triggerEvent.type,
                zone: triggerEvent.zone,
                status: 'PAID',
                gateway_tx_id: payoutResult.tx_id // Store the simulated TX ID
            });
            await newClaim.save();
            
            // Phase 3+: Proactive Payout Notification
            const alertMsg = `💰 *ClaimWire Payout Alert!*\n\nDisruption: ${triggerEvent.type} detected in ${triggerEvent.zone}.\nAn automated payout of *₹${fnol.estimatedLossAmount}* has been issued to your account.\nTX ID: ${payoutResult.tx_id}`;
            await sendWhatsAppNotification(policy.partner_id, alertMsg);

            console.log(`[💸] Success: Payout initiated. TX_ID: ${payoutResult.tx_id}`);
        } catch (err) {
            console.error(`Failed to process claim:`, err.message);
        }
    }
}

async function mockUPIPayout(partner_id, amount) {
    console.log(`[RAZORPAY] Processing ₹${amount} UPI transfer to partner ${partner_id}...`);
    // Simulate real gateway response
    return new Promise(resolve => setTimeout(() => {
        resolve({
            status: 'SUCCESS',
            tx_id: `pay_${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date().toISOString()
        });
    }, 1200));
}
