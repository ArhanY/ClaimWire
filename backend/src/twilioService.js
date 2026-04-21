import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

/**
 * Sends a WhatsApp message proactively (e.g. payout alert)
 * Since it uses Twilio Sandbox, the user must have joined the sandbox first.
 */
export const sendWhatsAppNotification = async (to, body) => {
    if (!client) {
        console.warn("[⚠️] Twilio credentials missing. Skipping proactive message.");
        return;
    }

    try {
        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to // e.g. "whatsapp:+919999999999"
        });
        console.log(`[📱] Proactive WhatsApp Sent to ${to}. SID: ${message.sid}`);
        return message;
    } catch (err) {
        console.error(`[❌] Twilio Send Error:`, err.message);
    }
};
