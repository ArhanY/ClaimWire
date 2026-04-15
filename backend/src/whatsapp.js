import express from 'express';
import axios from 'axios';
import { processIntent } from './llm.js';
import { GuidewirePCAdapter } from './guidewire.js';
import { query } from './db.js'; // Ensure we can save things

export const whatsappRouter = express.Router();

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'gigshield_secret_token';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// In-memory state (Use Redis in prod) for conversational flow
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
        // Twilio sends data as URL-encoded forms where body has 'From', 'Body', etc.
        const from = req.body.From; // e.g. "whatsapp:+14155238886"
        const msg_body = req.body.Body;

        if (!from || !msg_body) {
             return res.sendStatus(400);
        }

        console.log(`Received message from ${from}: ${msg_body}`);

        // AI Intent Router
        const aiResponse = await processIntent(msg_body);
        let replyText = aiResponse.mock_reply || "Hello! We are processing your request.";
        
        // Logic based on Intent
        switch (aiResponse.intent) {
            case 'CHECK_PRICE':
                try {
                    // Mock hitting ML Service for dynamic pricing (Assuming 'Andheri' zone for hackathon demo)
                    const priceRes = await axios.post(`${ML_SERVICE_URL}/api/ml/dynamic-price`, {
                        zone: "Andheri",
                        forecasted_rain_mm: 60.0,
                        forecasted_aqi: 100
                    });
                    
                    const premium = priceRes.data.weekly_premium_adjusted;
                    replyText = `Based on AI predictions for Andheri zone, your weekly GigShield premium is ₹${premium}. Reply "BUY" to activate protection against rain or pollution.`;
                    
                    // Save to context
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
                
                // 1. Simulate GW Account Creation
                const account = await GuidewirePCAdapter.createAccount({ name: "Gig Worker", phone: from });
                
                // 2. Simulate GW Policy Bind
                const policy = await GuidewirePCAdapter.createWeeklyPolicy(account.accountId, context.pendingPremium);
                
                replyText = `✅ Policy Activated!\nGuidewire Policy No: ${policy.policyNumber}\nValid Until: ${new Date(policy.periodEnd).toLocaleDateString()}.\nYour income is now protected against extreme disruptions!`;
                
                delete userState[from]; // Clear context
                break;
            
            case 'CHECK_CLAIM':
                replyText = `Our system automatically monitors conditions. If your zone triggers an alert (e.g. Heavy Rain), you will receive an automatic payout. If you believe a payout was missed, our support team will contact you.`;
                break;
            
            default:
                replyText = aiResponse.mock_reply || "Sorry, I didn't catch that. Try asking about 'price' or 'claim'.";
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
