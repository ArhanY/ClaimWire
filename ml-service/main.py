from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import math
import json
import os
from datetime import datetime

load_dotenv()

app = FastAPI(title="ClaimWire Advanced Fraud Engine", version="3.0.0")

# Load Mock Historical Data
HISTORICAL_FILE = os.path.join(os.path.dirname(__file__), "historical_data.json")
def load_historical():
    try:
        with open(HISTORICAL_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

class FraudCheckRequest(BaseModel):
    partner_id: str
    zone: str
    distance_from_home_km: float
    travel_time_minutes: float # time since last GPS ping
    claimed_at: str # ISO format
    trigger_type: str # e.g. "SEVERE_RAIN"

@app.post("/api/ml/fraud-score")
def get_fraud_score(req: FraudCheckRequest):
    anomaly_reasons = []
    risk_score = 0.0

    # 1. GPS Spoofing Detection (Speed Anomaly)
    if req.travel_time_minutes > 0:
        speed_kmh = (req.distance_from_home_km / (req.travel_time_minutes / 60))
        if speed_kmh > 100: # Impossible for a delivery bike in traffic
            risk_score += 0.7
            anomaly_reasons.append(f"Impossible Travel Speed: {round(speed_kmh, 1)} km/h")
        elif speed_kmh > 60:
            risk_score += 0.3
            anomaly_reasons.append("Suspicious Travel Pattern")

    # 2. Historical Weather Consistency check
    history = load_historical()
    zone_history = history.get(req.zone, [])
    
    # Try to find a matching event in the last hour of claimed_at
    found_event = False
    for event in zone_history:
        # Simplistic timestamp matching for demo
        if req.trigger_type == "SEVERE_RAIN" and event.get("rain_mm", 0) > 50:
            found_event = True
            break
        if req.trigger_type == "SEVERE_SMOG" and event.get("aqi", 0) > 300:
            found_event = True
            break
            
    if not found_event:
        risk_score += 0.5
        anomaly_reasons.append(f"No matching {req.trigger_type} event recorded in {req.zone} history")

    # 3. Normalization
    fraud_risk = min(1.0, risk_score)
    is_anomaly = fraud_risk > 0.6

    return {
        "partner_id": req.partner_id,
        "is_anomaly": is_anomaly,
        "fraud_risk_score": fraud_risk,
        "reasons": anomaly_reasons,
        "recommend_manual_review": is_anomaly
    }

@app.post("/api/ml/dynamic-price")
def calculate_weekly_premium(req: dict): # Simplified for dynamic access
    zone = req.get("zone", "Default")
    rain = req.get("forecasted_rain_mm", 0)
    
    base_premium = 25.0
    zone_risk = {"Andheri": 1.2, "Powai": 1.0, "Kurla": 1.5, "Bandra": 0.9}
    factor = zone_risk.get(zone, 1.0)
    
    weather_multiplier = 1.0
    if rain > 50: weather_multiplier += 0.25
        
    return {
        "weekly_premium_adjusted": round(base_premium * factor * weather_multiplier, 2),
        "currency": "INR"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
