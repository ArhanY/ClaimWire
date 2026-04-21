import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const RIDER_PHONE = '919123456789';
const WEBHOOK_URL = 'http://localhost:3000/api/whatsapp/webhook';

console.log("====================================================");
console.log("📱 CLAIMWIRE RIDER PHONE SIMULATOR (WhatsApp Mock)");
console.log("====================================================");
console.log("Try typing things like:");
console.log(" - 'I want to check the price for my zone'");
console.log(" - 'Buy'");
console.log(" - 'Is my claim arriving? It rained heavily today.'");
console.log("Type 'exit' to quit.\n");

async function sendMessage(text) {
    try {
        // Format precisely as Twilio URL-encoded data
        const payload = new URLSearchParams({
            From: `whatsapp:+${RIDER_PHONE}`,
            Body: text
        });

        // Send via Axios using URL-encoded content type
        await axios.post(WEBHOOK_URL, payload.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        // The server processes it asynchronously.
        // For this hackathon mock, since we don't have a real WhatsApp webhook receiving the reply,
        // you will see the server's reply printed in the [Node.js Backend] terminal tab!
        console.log(`\n[✓] Message Sent!`);
        console.log(`👉 Look at the "Node.js Backend" terminal window to see the Bot's reply!`);
        
    } catch (err) {
        console.error("Failed to reach backend:", err.message);
    }
}

function promptRider() {
    rl.question('\n[You]: ', async (msg) => {
        if (msg.trim().toLowerCase() === 'exit' || msg.trim().toLowerCase() === 'quit') {
            rl.close();
            return;
        }
        await sendMessage(msg);
        setTimeout(promptRider, 1000); // Slight delay for the next prompt
    });
}

promptRider();
