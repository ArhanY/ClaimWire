import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export async function processIntent(userMessage) {
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
         console.warn("GEMINI_API_KEY not set or invalid. Using fallback mock router.");
         return mockProcessIntent(userMessage);
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const prompt = `
        You are an AI assistant for ClaimWire, a parametric insurance platform for gig workers (food delivery).
        Analyze the following message from a gig worker and determine their INTENT and any extracted ENTITIES.
        
        Valid INTENTS:
        - CHECK_PRICE: User wants to know the price or buy a policy.
        - BUY_POLICY: User agrees to start/buy a policy.
        - CHECK_CLAIM: User is asking about claim status or reporting an issue.
        - HELP: General inquiry or confusion.
        
        Message: "${userMessage}"
        
        Respond ONLY with a valid JSON object in this format:
        {
           "intent": "INTENT_NAME",
           "entities": {
               "action": "implied action",
               "condition": "weather/rain/etc"
           },
           "mock_reply": "A brief contextual response acknowledge their query"
        }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Gemini Intent Error:", error);
        return mockProcessIntent(userMessage);
    }
}

// Fallback if API key missing
function mockProcessIntent(message) {
    const lower = message.trim().toLowerCase();
    
    if (lower === 'buy' || lower === 'buy policy' || lower.includes('activate')) {
         return { intent: 'BUY_POLICY', mock_reply: "Processing your policy purchase." };
    }
    if (lower.includes('buy') || lower.includes('price')) {
         return { intent: 'CHECK_PRICE', mock_reply: "I understand you want to check the weekly premium in your zone." };
    }
    if (lower.includes('claim') || lower.includes('barish') || lower.includes('rain')) {
         return { intent: 'CHECK_CLAIM', mock_reply: "I understand you're facing weather issues. Let me check your active policy and claims." };
    }
    return { intent: 'HELP', mock_reply: "How can I help you regarding ClaimWire income protection today?" };
}
