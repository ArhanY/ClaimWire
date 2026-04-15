from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import math

load_dotenv()

app = FastAPI(title="GigShield ML Service", version="1.0.0")

# Replaced scikit-learn with rule-based "Isolation Forest Simulate"
# since Python 3.13 doesn't have scikit-learn wheel build tools natively
# It mathematically mimics anomaly detection.

class FraudCheckRequest(BaseModel):
    partner_id: str
    claims_in_last_30_days: int
    distance_from_home_zone_km: float
    time_since_last_claim_days: int

class PriceRequest(BaseModel):
    zone: str
    forecasted_rain_mm: float
    forecasted_aqi: int

@app.get("/health")
def health_check():
    return {"status": "ML Service Operational (Fast Mode)"}

@app.post("/api/ml/fraud-score")
def get_fraud_score(req: FraudCheckRequest):
    # Rule-based Anomaly Simulation:
    # High frequency claims, huge distance from home -> Anomaly Score spikes

    anomaly_score = 0.0
    
    # 1. Distance penalty
    if req.distance_from_home_zone_km > 10.0:
        anomaly_score += 0.4
    if req.distance_from_home_zone_km > 30.0:
        anomaly_score += 0.5

    # 2. Claim frequency penalty
    if req.claims_in_last_30_days > 4:
        anomaly_score += 0.6
    elif req.claims_in_last_30_days > 2:
        anomaly_score += 0.3

    # Normalize between 0 and 1
    fraud_risk = min(1.0, anomaly_score)

    return {
        "partner_id": req.partner_id,
        "is_anomaly": bool(fraud_risk > 0.8),
        "raw_isolation_score": -fraud_risk, # mimicking isolation forest output
        "fraud_risk_normalized": float(fraud_risk),
        "recommend_manual_review": bool(fraud_risk > 0.8)
    }

@app.post("/api/ml/dynamic-price")
def calculate_weekly_premium(req: PriceRequest):
    base_premium = 25.0
    
    zone_risk = {
        "Andheri": 1.1,
        "Powai": 1.0,  
        "Kurla": 1.5,
        "Bandra": 0.9
    }
    
    factor = zone_risk.get(req.zone, 1.0)
    
    weather_multiplier = 1.0
    if req.forecasted_rain_mm > 50:
        weather_multiplier += 0.2
    if req.forecasted_aqi > 300:
        weather_multiplier += 0.15
        
    final_premium = round(base_premium * factor * weather_multiplier, 2)
    
    return {
        "zone": req.zone,
        "base_premium": base_premium,
        "weekly_premium_adjusted": final_premium,
        "currency": "INR"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
