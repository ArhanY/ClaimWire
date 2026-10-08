# 🛡️ ClaimWire — AI-Powered Parametric Insurance for Gig Workers

> **Delivery riders lose income when it rains too hard, the air turns toxic, or the app goes down. ClaimWire pays them automatically, with no claim forms and no waiting.**

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-WhatsApp-F22F46?logo=twilio&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-UPI%20Payouts-0C2451)

---

## 📌 TL;DR (30-second summary)

| | |
|---|---|
| **Problem** | Gig and delivery workers have no safety net when weather or outages stop them from earning. Traditional insurance is slow, paperwork-heavy, and not built for weekly income. |
| **Solution** | A **parametric** insurance platform: if a measurable event happens (e.g. rainfall > 50 mm), affected riders are paid out **automatically**. |
| **How it works** | WhatsApp onboarding → AI-priced weekly policy → real-time trigger monitoring → fraud check → instant UPI payout |
| **Built with** | Node.js · Python (FastAPI) · React · Google Gemini · Twilio · Razorpay |
| **Architecture** | 3 independent services: backend orchestrator, ML service, admin dashboard |

---

## 💡 Why This Project Matters

Food delivery partners and gig workers earn day to day. A single day of heavy rain or a platform outage can wipe out their income, yet filing an insurance claim is the last thing they have time or patience for.

**Parametric insurance** fixes this by paying on a *verifiable event*, not on a paperwork process. ClaimWire turns that idea into a working end-to-end system:

- ✅ **Zero manual claims**: riders never file anything
- ✅ **No app download**: everything happens over WhatsApp
- ✅ **Fair, dynamic pricing**: premiums reflect real-time risk in the rider's zone
- ✅ **Instant payouts**: money is sent via UPI the moment a trigger is validated

---

## ✨ Key Features

### 1. 💬 Frictionless WhatsApp Onboarding
Riders register and buy cover through a conversational bot (Twilio + **Google Gemini**). No forms, no new app, just chat.

### 2. 🧠 AI-Driven Dynamic Premiums
A dedicated **Python / FastAPI ML service** calculates each rider's weekly premium. If the model detects a high-risk zone (for example, severe rainfall incoming), the quote adjusts upward in real time, keeping pricing fair and the insurer sustainable.

### 3. ⚡ Zero-Touch Claim Automation
A **Node-Cron trigger engine** polls data sources every 60 seconds and watches for four disruption events:

| Trigger | Condition |
|---|---|
| 🌧️ `SEVERE_RAIN` | Precipitation > 50 mm |
| 😷 `SEVERE_SMOG` | AQI > 400 |
| 🔥 `HEATWAVE` | Temperature > 45 °C |
| 📴 `PLATFORM_OUTAGE` | App downtime > 120 min |

### 4. 🕵️ Built-in Fraud Detection
Before any money moves, each payout is scored by an **anomaly-detection engine** to catch suspicious patterns.

### 5. 📊 Real-Time Admin Dashboard
A **React + Vite** dashboard shows the live event feed, active policies, payouts, and loss ratios, giving an insurer full visibility at a glance.

---

## 🔄 How It Works (End-to-End Flow)

```
 Rider (WhatsApp)
       │  "Check price" → "BUY"
       ▼
 ┌─────────────────────┐      ┌──────────────────────────┐
 │  Node.js Backend    │◄────►│  Python ML Service       │
 │  (Orchestrator)     │      │  • Dynamic pricing       │
 │  • Gemini chatbot   │      │  • Fraud / anomaly score │
 │  • Cron triggers    │      └──────────────────────────┘
 └─────────┬───────────┘
           │ every 60s: weather / AQI / outage check
           ▼
   Trigger fires? ──► Find active policies in the affected zone
                  ──► Fraud check
                  ──► File simulated FNOL (ClaimCenter)
                  ──► Auto-approve & pay via Razorpay UPI
           │
           ▼
 ┌─────────────────────┐
 │ React Admin Dashboard│  ← live feed, policies, loss ratios
 └─────────────────────┘
```

---

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend Orchestrator** | Node.js, Express, node-cron |
| **AI & Messaging** | Google Gemini, Twilio (WhatsApp webhooks) |
| **ML Service** | Python, FastAPI |
| **Frontend** | React, Vite |
| **Payments** | Razorpay UPI API |
| **Simulated Insurance Core** | ClaimWire PolicyCenter & ClaimCenter (mock services) |

---

## 🧠 Engineering Highlights

- **Microservice-style separation**: orchestration (Node), intelligence (Python), and presentation (React) run as independent services that communicate over HTTP.
- **Event-driven automation**: a scheduled trigger engine converts real-world signals into financial actions with no human in the loop.
- **Conversational UX**: LLM-powered chat replaces forms, designed for users with low friction tolerance.
- **Risk-aware pricing**: ML-based premium adjustment tied to live environmental conditions.
- **Fraud guardrails**: payouts are validated before approval, not after.

---

## 🚀 Getting Started

You'll run **3 services** locally.

**Prerequisites:** Node.js 18+, Python 3.9+, npm

### 1️⃣ Start the ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2️⃣ Start the Backend Orchestrator
```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Start the Admin Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173**

> 💡 **Windows shortcut:** run `start.bat` from the project root to launch everything.

---

## 🎬 Try It Without Twilio (Terminal Simulator)

No Twilio account? No problem. Simulate the full rider journey from your terminal:

```bash
cd backend
node simulator.js
```

1. Type `Check price` → get an AI-calculated weekly quote
2. Type `BUY` → your policy is created
3. Wait up to 60 seconds → the trigger engine detects a simulated storm, files the claim, and sends the payout, **with zero action from you**

---

## 📁 Project Structure

```
ClaimWire/
├── backend/       # Node.js orchestrator: chatbot, cron triggers, claim automation
├── ml-service/    # FastAPI service: dynamic pricing + fraud detection
├── frontend/      # React admin dashboard
└── start.bat      # One-click launcher (Windows)
```

---

## 🗺️ Roadmap

- [ ] Integrate live weather / AQI APIs in place of mock data
- [ ] Connect to real insurer core systems (policy & claims)
- [ ] Add multi-language support for WhatsApp bot
- [ ] Expand triggers (floods, curfews, traffic disruptions)
- [ ] Production payouts and compliance hardening

---

## 📝 Notes

This project was built for a hackathon (Phase 3: *"The Smart Payout Engine"*). Insurance core systems and some data feeds are **simulated** for demonstration purposes.

---

## 👤 Author

**Arhan Y** — [GitHub](https://github.com/ArhanY)

*If you found this project interesting, feel free to ⭐ the repo!*
