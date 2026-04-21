import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { whatsappRouter } from './whatsapp.js';
import { startTriggerEngine } from './triggers.js';
import { Policy, Claim } from './models.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/whatsapp', whatsappRouter);

// Dashboard API Endpoints
app.get('/api/policies', async (req, res) => {
    try {
        const policies = await Policy.find().sort({ createdAt: -1 });
        res.json(policies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/claims', async (req, res) => {
    try {
        const claims = await Claim.find().sort({ createdAt: -1 });
        res.json(claims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const totalPolicies = await Policy.find();
        const totalPremiums = totalPolicies.reduce((sum, p) => sum + p.premium, 0);
        
        const paidClaims = await Claim.find({ status: 'PAID' });
        const totalPaid = paidClaims.reduce((sum, c) => sum + c.amount, 0);
        
        const fraudFlags = await Claim.countDocuments({ status: 'FLAGGED' });

        // Phase 3: Intelligent Loss Ratio
        // (Total Claims / Total Premiums)
        const lossRatio = totalPremiums > 0 ? (totalPaid / totalPremiums) * 100 : 0;

        res.json({
            activePolicies: totalPolicies.length,
            totalPaid: totalPaid,
            claimCount: paidClaims.length,
            fraudFlags: fraudFlags,
            lossRatio: lossRatio.toFixed(1)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Phase 3: Manual Simulation Trigger (For Demo Video)
import { processAutomatedClaims } from './triggers.js';

app.post('/api/simulate', async (req, res) => {
    try {
        const { type, zone } = req.body;
        const triggerEvent = { 
            type: type || 'SEVERE_RAIN', 
            value: 55.0, 
            zone: zone || 'Andheri' 
        };
        
        console.log(`[🕹️] Manual Simulation Triggered: ${triggerEvent.type} in ${triggerEvent.zone}`);
        
        // This will run in the background (async)
        processAutomatedClaims(triggerEvent);
        
        res.json({ message: "Simulation started", event: triggerEvent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'ClaimWire Phase 3 Backend' });
});

app.listen(port, () => {
    console.log(`[🚀] ClaimWire Backend running on http://localhost:${port}`);
});

// Start the automation background job
startTriggerEngine();
