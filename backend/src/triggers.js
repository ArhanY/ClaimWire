import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import { GuidewireCCAdapter } from './guidewire.js';

dotenv.config();

const OWM_API_KEY = process.env.OWM_API_KEY;
const AQI_API_KEY = process.env.AQI_API_KEY;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Mock active policies Database 
const activePolicies = [
    { partner_id: 'part_123', zone: 'Andheri', policyNumber: 'GW2026-98213', phoneNumber: '+919999999999' }
];

export function startTriggerEngine() {
    console.log("[⚙️] Starting Parametric Trigger Engine (Checking every 10 mins)...");

    // Runs every 10 minutes in real scenario, we'll run it every 1 minute for demo
    cron.schedule('*/1 * * * *', async () => {
        try {
            console.log("\n[🌡] Polling Weather & AQI APPs for disruptions...");
            
            // Mocking the API response because real API needs proper coords and paid tiers for hourly forecast
            const mockWeather = { rain_mm: 55.0, temp: 46 }; 
            const mockAQI = { aqi: 150 }; 
            const mockPlatformState = { isDown: false, downtimeMinutes: 0 }; 

            // 1. Check Conditions (3-5 Triggers needed for Rubric)
            let triggerEvent = null;
            if (mockWeather.rain_mm > 50) {
                triggerEvent = { type: 'SEVERE_RAIN', value: mockWeather.rain_mm, zone: 'Andheri' };
            } else if (mockAQI.aqi > 400) {
                triggerEvent = { type: 'SEVERE_SMOG', value: mockAQI.aqi, zone: 'Andheri' };
            } else if (mockWeather.temp > 45) {
                triggerEvent = { type: 'HEATWAVE', value: mockWeather.temp, zone: 'Andheri' };
            } else if (mockPlatformState.isDown && mockPlatformState.downtimeMinutes > 120) {
                triggerEvent = { type: 'PLATFORM_OUTAGE', value: mockPlatformState.downtimeMinutes, zone: 'Andheri' };
            }

            // 2. Process Claims if Trigger hit
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

async function processAutomatedClaims(triggerEvent) {
    // A. Find impacted policies
    const impacted = activePolicies.filter(p => p.zone === triggerEvent.zone);
    console.log(`[🔎] Found ${impacted.length} active policies in ${triggerEvent.zone}`);

    for (const policy of impacted) {
        // B. Send for Fraud Check (ML Service)
        const fraudReq = {
            partner_id: policy.partner_id,
            claims_in_last_30_days: 0,
            distance_from_home_zone_km: 1.2,
            time_since_last_claim_days: 100
        };

        const fraudRes = await axios.post(`${ML_SERVICE_URL}/api/ml/fraud-score`, fraudReq);
        const { is_anomaly, recommend_manual_review } = fraudRes.data;

        if (recommend_manual_review) {
            console.log(`[⚠️] Fraud Risk High for ${policy.partner_id}. Sent to Manual Review.`);
            continue; // Skip auto-payout
        }

        // C. Create FNOL in Guidewire
        const fnol = await GuidewireCCAdapter.createFNOL(policy.policyNumber, triggerEvent);

        // D. Auto-Approve Claim
        const claim = await GuidewireCCAdapter.approveAndPayClaim(fnol.claimNumber);

        // E. Initiate Razorpay UPI payout
        await mockUPIPayout(policy.partner_id, fnol.estimatedLossAmount);
        
        console.log(`[💸] Success: Payout initiated for ${policy.phoneNumber}`);
        // Can optionally send a WhatsApp message here confirming payout.
    }
}

async function mockUPIPayout(partner_id, amount) {
    // In production, instantiate Razorpay and execute POST /payouts
    console.log(`[RAZORPAY] Processing ₹${amount} UPI transfer to partner ${partner_id}...`);
    return new Promise(resolve => setTimeout(resolve, 800));
}
