import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { whatsappRouter } from './whatsapp.js';
import { startTriggerEngine } from './triggers.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/whatsapp', whatsappRouter);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'GigShield Phase 2 Backend' });
});

app.listen(port, () => {
    console.log(`[🚀] GigShield Backend running on http://localhost:${port}`);
});

// Start the automation background job
startTriggerEngine();
