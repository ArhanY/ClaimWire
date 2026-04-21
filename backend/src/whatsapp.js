import express from 'express';
import axios from 'axios';
import { ClaimWirePCAdapter } from './claimwire.js';
import { Policy, Claim } from './models.js';
import { sendWhatsAppNotification } from './twilioService.js';
import { processIntent } from './llm.js';

export const whatsappRouter = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'claimwire_secret_token';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// In-memory state for conversational flow (temp session)
const userState = {};

whatsappRouter.get('/webhook', (req, res) => {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

whatsappRouter.post('/webhook', async (req, res) => {
    try {
        const from = req.body.From; 
        const msg_body = req.body.Body;

        if (!from || !msg_body) {
             return res.sendStatus(400);
        }

        console.log(`Received message from ${from}: ${msg_body}`);

        // AI Intent Router
        const aiResponse = await processIntent(msg_body);
        let replyText = aiResponse.mock_reply || "Hello! We are processing your request.";
        
        switch (aiResponse.intent) {
            case 'CHECK_PRICE':
                try {
                    const priceRes = await axios.post(`${ML_SERVICE_URL}/api/ml/dynamic-price`, {
                        zone: "Andheri",
                        forecasted_rain_mm: 60.0,
                        forecasted_aqi: 100
                    });
                    
                    const premium = priceRes.data.weekly_premium_adjusted;
                    replyText = `Based on AI predictions for Andheri zone, your weekly ClaimWire premium is ₹${premium}. Reply "BUY" to activate protection against rain or pollution.`;
                    
                    userState[from] = { pendingPremium: premium, zone: "Andheri" };
                } catch (err) {
                    console.error("ML pricing fail:", err.message);
                    replyText = "We could not fetch your dynamic price right now. Try again later.";
                }
                break;

            case 'BUY_POLICY':
            case 'BUY':
                let context = userState[from];
                if (!context || !context.pendingPremium) {
                    replyText = "Please ask for a quote first by saying 'check price'.";
                    break;
                }
                
                // 1. Simulate CW Account & Policy
                const account = await ClaimWirePCAdapter.createAccount({ name: "Gig Worker", phone: from });
                const gwPolicy = await ClaimWirePCAdapter.createWeeklyPolicy(account.accountId, context.pendingPremium);
                
                // 2. 🍃 PERSIST TO MONGODB
                const newPolicy = new Policy({
                    partner_id: from,
                    policyNumber: gwPolicy.policyNumber,
                    zone: context.zone,
                    premium: context.pendingPremium,
                    periodStart: gwPolicy.periodStart,
                    periodEnd: gwPolicy.periodEnd,
                    status: 'ACTIVE'
                });
                await newPolicy.save();

                const successMsg = `✅ Policy Activated!\nClaimWire Policy No: ${gwPolicy.policyNumber}\nValid Until: ${new Date(gwPolicy.periodEnd).toLocaleDateString()}.\nYour income is now protected!`;
                
                // Phase 3+: Proactive Confirmation
                await sendWhatsAppNotification(from, successMsg);

                replyText = successMsg;
                
                delete userState[from]; 
                break;
            
            case 'CHECK_CLAIM':
            case 'CHECK_STATUS':
            case 'STATUS':
                // Phase 3: WhatsApp Worker Dashboard
                const activePolicy = await Policy.findOne({ partner_id: from, status: 'ACTIVE' });
                const recentClaims = await Claim.find({ partner_id: from }).sort({ createdAt: -1 }).limit(3);
                
                if (!activePolicy) {
                    replyText = "You don't have an active policy. Type 'check price' to protect your earnings!";
                } else {
                    const totalPaid = recentClaims.reduce((sum, c) => sum + (c.status === 'PAID' ? c.amount : 0), 0);
                    replyText = `🛡️ *Your ClaimWire Hub*\n\nStatus: ✅ ACTIVE\nZone: ${activePolicy.zone}\nValid Until: ${new Date(activePolicy.periodEnd).toLocaleDateString()}\n\n💰 Total Protected Earnings Paid: ₹${totalPaid}\nRecent Payouts: ${recentClaims.length > 0 ? recentClaims.map(c => `\n- ₹${c.amount} (${c.triggerType})`).join('') : 'None yet'}`;
                }
                break;
            
            default:
                replyText = aiResponse.mock_reply || "Sorry, I didn't catch that. Say 'status' to check your coverage or 'price' for a quote.";
        }

        // Reply back directly using Twilio's XML format (TwiML)
        let twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Message>${replyText}</Message>
        </Response>`;

        res.type('text/xml').send(twiml);
        console.log(`[WHATSAPP TX -> ${from}]: ${replyText}`);

    } catch (e) {
        console.error("Webhook processing error:", e);
        res.sendStatus(500);
    }
});
