# 🛡️ GigShield: AI-Powered Parametric Insurance

**Phase 2 Submission ("Protect Your Worker")**

GigShield is a revolutionary, week-to-week parametric insurance engine designed specifically to protect food delivery partners and gig workers from unavoidable income loss—with absolutely **zero manual claims required**.

---

## 🚀 The Core Features

### 1. Frictionless WhatsApp Registration
Riders do not need to download a new app or fill out confusing forms. The entire customer journey happens instantly via our conversational **WhatsApp / Twilio Bot** powered by Google Gemini AI.

### 2. AI Dynamic Premium Calculation
To ensure fair pricing, we integrated a **Python ML Service** via FastAPI. Using an AI Isolation framework, the system dynamically calculates the weekly premium. If the ML model detects the rider operates in a high-risk zone (e.g., severe impending rainfall), it mathematically adjusts the quote upward in real-time.

### 3. The "Zero-Touch" Claim Automation
To create the best User Experience possible, our riders *never file a claim*. We built a robust **Node-Cron Trigger Engine** that polls public/mock APIs every 60 seconds tracking **4 automated disruption triggers**:
*   `SEVERE_RAIN` (>50mm precipitation)
*   `SEVERE_SMOG` (AQI > 400)
*   `HEATWAVE` (Temperatures > 45°C)
*   `PLATFORM_OUTAGE` (App downtime > 120mins)

### 4. Seamless Enterprise Integration
When a weather trigger fires, the backend automatically:
1. Cross-references active policies in the affected zone.
2. Validates against our **Python Fraud Detection Engine** (Anomaly scoring).
3. Files a simulated `Parametric_IncomeLoss` FNOL in **Guidewire ClaimCenter**.
4. Auto-approves the payout and instantly pushes funds via the **Razorpay UPI API**.

All of this is visualized in real-time on our premium **React Admin Dashboard**.

---

## 🛠️ Tech Stack & Architecture
- **Backend Orchestrator**: Node.js, Express, node-cron
- **AI & Messaging**: Google Gemini 1.5 Pro, Twilio API webhooks
- **Machine Learning Engine**: Python, FastAPI
- **Frontend Dashboard**: React, Vite
- **Simulated APIs**: Guidewire PolicyCenter, Guidewire ClaimCenter, Razorpay API

---

## ⚙️ How to Run Locally

You will need to start 3 separate severs to run the platform locally.

### 1. Start the Machine Learning Engine
Handles dynamic pricing algorithms and fraud anomaly detection.
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the Node.js Orchestrator
Handles the cron-jobs, Guidewire automation, and webhooks.
```bash
cd backend
npm install
npm run dev
```

### 3. Start the React Admin Dashboard
Visualizes the active live feed, loss ratios, and policies.
```bash
cd frontend
npm install
npm run dev
```
*The dashboard will be available at `http://localhost:5173`*

---

## 📱 Running the Twilio Phone Simulator
If you do not have a live Twilio Sandbox configured, you can test the entire conversation flow and webhook architecture by using our highly technical Terminal Simulator:

```bash
cd backend
node simulator.js
```
1. Type `"Check price"` in the simulator.
2. Type `"BUY"` to generate the Guidewire Policy.
3. Wait up to 60 seconds for the backend `cron` job to detect a simulated storm. Watch the server magically issue the FNOL and Razorpay Payout without user interaction!

---
*Built with ❤️ for Phase 2 of the Hackathon.*
