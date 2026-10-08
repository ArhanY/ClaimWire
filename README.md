# 🛡️ ClaimWire — AI-Powered Parametric Insurance

> **Automated insurance protection for delivery partners and gig workers, enabling zero-touch claim processing and instant payouts based on real-time disruption triggers.**

ClaimWire is an AI-powered **parametric insurance platform** designed for delivery partners and gig workers who face income loss due to external disruptions such as severe weather, extreme heat, air pollution, and platform outages.

Instead of requiring users to manually file claims, ClaimWire continuously monitors predefined disruption conditions and automatically initiates the claim and payout workflow when an eligible trigger occurs.

Built as a **Phase 3 submission for a national insurance technology hackathon**.

---

## 🚀 Key Features

### 💬 1. WhatsApp-Based Registration

Users can interact with ClaimWire through a conversational WhatsApp interface powered by **Twilio** and **Google Gemini**.

The workflow allows users to:

- Check insurance pricing
- Purchase a policy
- Receive policy information
- Interact with the insurance system without requiring a separate application

---

### 🤖 2. AI-Based Dynamic Premium Calculation

ClaimWire uses a dedicated **Python/FastAPI machine-learning service** to calculate dynamic weekly premiums.

The system considers risk conditions and adjusts the premium based on the rider's operating environment.

This allows the platform to provide more risk-aware and flexible pricing.

---

### ⚡ 3. Zero-Touch Claim Automation

ClaimWire eliminates the need for riders to manually submit claims.

A **Node.js cron-based trigger engine** continuously checks disruption data and detects predefined events:

| Trigger | Condition |
|---|---|
| `SEVERE_RAIN` | > 50 mm precipitation |
| `SEVERE_SMOG` | AQI > 400 |
| `HEATWAVE` | Temperature > 45°C |
| `PLATFORM_OUTAGE` | Platform downtime > 120 minutes |

When a qualifying event occurs, the claim workflow is automatically initiated.

---

### 🔄 4. Automated Claim Processing

Once a disruption is detected, the backend performs the following workflow:

```text
Environmental / Platform Trigger
            ↓
     Identify Affected Zone
            ↓
     Check Active Policies
            ↓
      Fraud / Anomaly Check
            ↓
       Create FNOL
            ↓
      Approve Eligible Claim
            ↓
      Trigger Payout
            ↓
       Notify Customer
```

This creates a **zero-touch claim experience** with minimal manual intervention.

---

### 🔍 5. Fraud Detection

Before processing a payout, ClaimWire sends relevant claim information to the **Python-based fraud detection service**.

The service performs anomaly scoring to identify potentially suspicious claim activity before the payout is processed.

---

### 💳 6. Automated Payout

Eligible claims are automatically processed through the simulated payment integration.

ClaimWire uses the **Razorpay UPI API** to simulate instant payout processing after claim approval.

---

### 📊 7. Real-Time Admin Dashboard

A React-based administration dashboard provides visibility into:

- Active policies
- Environmental triggers
- Claims
- Payouts
- Loss ratios
- Live system activity

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │   User / Rider      │
                         └──────────┬──────────┘
                                    │
                              WhatsApp
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Twilio + Gemini AI  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                    ┌────────────────────────────┐
                    │ Node.js / Express Backend  │
                    │      Orchestrator          │
                    └─────────────┬──────────────┘
                                  │
               ┌──────────────────┼──────────────────┐
               │                  │                  │
               ▼                  ▼                  ▼
        Trigger Engine       Policy Service     External APIs
          node-cron                              / Mock APIs
               │
               ▼
       ┌─────────────────┐
       │ Python / FastAPI│
       │   ML Services   │
       └────────┬────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
 Dynamic Pricing    Fraud Detection
        │                │
        └───────┬────────┘
                ▼
        Claim Processing
                │
                ▼
        Razorpay / UPI API
                │
                ▼
          Payout + Notification
```

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- node-cron
- REST APIs
- Webhooks

### AI & Machine Learning
- Google Gemini
- Python
- FastAPI
- Machine Learning / Anomaly Detection

### Frontend
- React
- Vite

### Integrations
- Twilio API
- Razorpay UPI API
- Simulated PolicyCenter / ClaimCenter APIs

---

## 📁 Project Structure

```text
ClaimWire/
│
├── backend/
│   ├── ...
│   └── simulator.js
│
├── frontend/
│   └── ...
│
├── ml-service/
│   ├── main.py
│   └── requirements.txt
│
├── start.bat
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Python 3.x
- pip

---

### 1. Clone the Repository

```bash
git clone https://github.com/ArhanY/ClaimWire.git
cd ClaimWire
```

---

### 2. Start the ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The ML service handles dynamic pricing and fraud/anomaly detection.

---

### 3. Start the Backend

Open a new terminal:

```bash
cd backend
npm install
npm run dev
```

The backend handles:

- API requests
- Webhooks
- Automated workflows
- Cron-based trigger detection
- Claim processing

---

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at:

```text
http://localhost:5173
```

---

## 📱 Testing Without Twilio

If a live Twilio Sandbox is not configured, ClaimWire includes a terminal simulator for testing the conversational workflow.

```bash
cd backend
node simulator.js
```

Then:

```text
Check price
```

to request a quote.

Use:

```text
BUY
```

to generate a policy.

The backend can then detect a simulated disruption through the cron-based trigger engine and automatically execute the claim workflow.

---

## 🔄 Example Claim Flow

```text
1. Rider purchases a policy
              ↓
2. ClaimWire tracks disruption conditions
              ↓
3. Severe event is detected
              ↓
4. Affected policies are identified
              ↓
5. Fraud/anomaly validation is performed
              ↓
6. FNOL is automatically created
              ↓
7. Eligible claim is approved
              ↓
8. Payout is triggered
              ↓
9. Rider receives notification
```

---

## 🎯 Problem Solved

Traditional insurance claims often require users to:

- Identify the event
- File a claim
- Submit documentation
- Wait for verification
- Wait for approval
- Receive the payout

ClaimWire aims to automate this process for **predefined, objectively measurable disruptions**.

The parametric model allows the system to trigger claims based on predefined conditions rather than relying entirely on manual claim submission.

---

## 🌟 Highlights

- AI-powered insurance platform
- Parametric insurance workflow
- Automated claim initiation
- REST API-based backend
- AI/ML-powered pricing and anomaly detection
- WhatsApp-based user interaction
- Automated environmental trigger detection
- External API integration
- Automated payout workflow
- Real-time administrative monitoring

---

## 🏆 Hackathon

ClaimWire was developed as a **Phase 3 submission for a national insurance technology hackathon**, focusing on automated insurance solutions for gig and delivery workers.

---

## 📄 License

This project is intended for educational and hackathon purposes.
