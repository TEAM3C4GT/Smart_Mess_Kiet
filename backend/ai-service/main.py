from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import math
import urllib.request
import json
import os

from chat_api import router as chat_router

app = FastAPI(
    title="Smart Mess & KFC AI Forecasting Engine",
    description="Intelligent AI Microservice for Headcount Prediction, Day-of-Week Seasonality Regression & Wastage Minimization",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")

# Mess Guide chat endpoints (guide + agentic tools)
app.include_router(chat_router)

class KitchenBatch(BaseModel):
    rawRiceKg: float
    dalLiters: float
    vegPaneerKg: float
    rotisPcs: int
    oilSpicesKg: float
    bufferKg: float
    prepTarget: int
    bufferPortions: int

class WastageMetrics(BaseModel):
    staticWasteKg: float
    aiWasteKg: float
    wasteSavedKg: float
    costSavedRs: int
    wasteReductionPct: int

class HistoricalDayPoint(BaseModel):
    date: str
    day: str
    selected: int
    actual: int
    predicted: int
    variance: int
    accuracy: float
    wastageKg: float
    event: str

class ConfidenceInterval(BaseModel):
    min: int
    max: int

class ForecastResponse(BaseModel):
    success: bool
    meal: str
    scope: str
    date: str
    dayOfWeek: str
    scenario: str
    selectedCount: int
    predictedCount: int
    confidence: float
    confidenceInterval: ConfidenceInterval
    bufferPortions: int
    prepTarget: int
    historicalTurnoutRatio: float
    wma: int
    kitchenBatch: KitchenBatch
    wastageMetrics: WastageMetrics
    pastTrend: List[HistoricalDayPoint]

class Anomaly(BaseModel):
    id: Any
    title: str
    scope: str
    description: str
    severity: str
    metricDifference: Optional[str] = None
    actionRequired: Optional[str] = None
    mitigation: Optional[str] = None

def fetch_attendance_from_database() -> List[Dict[str, Any]]:
    """Fetches real historical dining turnout records from MongoDB via backend API"""
    url = f"{BACKEND_API_URL}/attendance"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmartMess-AI/2.1"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                payload = json.loads(response.read().decode("utf-8"))
                records = payload.get("attendance", [])
                if records:
                    return [
                        {
                            "date": r.get("date", ""),
                            "day": r.get("day", ""),
                            "meal": r.get("meal", ""),
                            "selected": int(r.get("selectedCount", 0)),
                            "actual": int(r.get("actualCount", 0)),
                            "predicted": int(r.get("predictedCount", 0)),
                            "wastageKg": float(r.get("wastageKg", 0.0)),
                            "accuracy": float(r.get("accuracy", 97.0)),
                            "event": r.get("event", "Campus Dining")
                        }
                        for r in records
                    ]
    except Exception as e:
        print(f"Error querying attendance from {url}: {e}")
    return []

def run_forecast_model(meal: str, selected_count: int, day_of_week: str = "Thu", scenario: str = "standard") -> Dict[str, Any]:
    dataset = fetch_attendance_from_database()
    if not dataset:
        raise HTTPException(status_code=503, detail="Database attendance records unavailable for AI forecasting. Please verify MongoDB is seeded.")

    meal_records = [h for h in dataset if h["meal"].lower() == meal.lower()]
    recent7 = meal_records[-7:] if len(meal_records) >= 7 else meal_records

    weights = [0.05, 0.06, 0.09, 0.12, 0.16, 0.22, 0.30]  # oldest to newest
    weighted_sum = 0.0
    total_w = 0.0
    tot_sel = 0
    tot_act = 0
    errs = []

    for idx, item in enumerate(recent7):
        w = weights[idx] if idx < len(weights) else 0.1
        actual = item["actual"]
        selected = item["selected"]
        pred = item["predicted"]

        weighted_sum += actual * w
        total_w += w
        tot_sel += selected
        tot_act += actual
        errs.append(abs(actual - pred) / (actual or 1))

    wma = weighted_sum / total_w if total_w > 0 else 190.0
    turnout_ratio = (tot_act / tot_sel) if tot_sel > 0 else 1.035

    dow_factors = {
        "Mon": 1.01, "Tue": 1.00, "Wed": 1.03,
        "Thu": 1.01, "Fri": 0.99, "Sat": 0.85, "Sun": 0.92
    }
    dow_factor = dow_factors.get(day_of_week, 1.01)

    scenario_factors = {
        "standard": 1.00, "rainy": 1.08, "exam": 1.12,
        "weekend_leave": 0.82, "festival_feast": 1.15
    }
    scenario_factor = scenario_factors.get(scenario, 1.00)

    base = (0.65 * (selected_count * turnout_ratio)) + (0.35 * wma)
    predicted = int(round(base * dow_factor * scenario_factor))

    mape = (sum(errs) / len(errs) * 100.0) if errs else 2.8
    confidence = max(88.0, min(97.8, round(100.0 - (mape * 1.35), 1)))

    margin = max(3, int(round(predicted * ((100.0 - confidence) / 100.0))))
    ci = ConfidenceInterval(min=predicted - margin, max=predicted + margin)

    buffer_portions = max(5, int(math.ceil(predicted * 0.042)))
    prep_target = predicted + buffer_portions

    batch = KitchenBatch(
        rawRiceKg=round(prep_target * 0.16, 1),
        dalLiters=round(prep_target * 0.14, 1),
        vegPaneerKg=round(prep_target * 0.16, 1),
        rotisPcs=prep_target * 3,
        oilSpicesKg=round(prep_target * 0.022, 1),
        bufferKg=round(buffer_portions * 0.28, 1),
        prepTarget=prep_target,
        bufferPortions=buffer_portions
    )

    static_prep = 205
    static_waste = round(((static_prep - predicted) * 0.38) + 5.2, 1)
    ai_waste = round((buffer_portions * 0.38) + 1.6, 1)
    saved_kg = max(0.0, round(static_waste - ai_waste, 1))

    wastage = WastageMetrics(
        staticWasteKg=static_waste,
        aiWasteKg=ai_waste,
        wasteSavedKg=saved_kg,
        costSavedRs=int(saved_kg * 180),
        wasteReductionPct=int(round((saved_kg / (static_waste or 1.0)) * 100))
    )

    past_trend = [
        HistoricalDayPoint(
            date=r["date"],
            day=r["day"],
            selected=r["selected"],
            actual=r["actual"],
            predicted=r["predicted"],
            variance=r["actual"] - r["selected"],
            accuracy=r["accuracy"],
            wastageKg=r["wastageKg"],
            event=r["event"]
        ) for r in recent7
    ]

    return {
        "predictedCount": predicted,
        "confidence": confidence,
        "confidenceInterval": ci,
        "bufferPortions": buffer_portions,
        "prepTarget": prep_target,
        "historicalTurnoutRatio": round(turnout_ratio, 3),
        "wma": int(round(wma)),
        "kitchenBatch": batch,
        "wastageMetrics": wastage,
        "pastTrend": past_trend
    }

@app.get("/")
def read_root():
    return {
        "service": "Smart Mess & KFC AI Forecasting Engine",
        "status": "active",
        "dataSource": "MongoDB via Backend API",
        "version": "2.1.0",
        "algorithm": "Weighted Moving Average (WMA) + Day-of-Week Seasonality + Intent Regression",
        "endpoints": ["/api/ai/forecast/{scope}/{date}", "/api/ai/anomalies", "/api/ai/historical-data", "/chat"]
    }

@app.get("/api/ai/forecast/{scope}/{date}", response_model=ForecastResponse)
def get_forecast(
    scope: str,
    date: str,
    meal: str = Query("Lunch"),
    scenario: str = Query("standard"),
    customSelected: Optional[int] = Query(None)
):
    default_selections = {"Breakfast": 169, "Lunch": 185, "Snacks": 140, "Dinner": 178}
    selected_count = customSelected if customSelected is not None else default_selections.get(meal, 185)

    forecast_results = run_forecast_model(
        meal=meal,
        selected_count=selected_count,
        day_of_week="Thu",
        scenario=scenario
    )

    return ForecastResponse(
        success=True,
        meal=meal,
        scope=scope,
        date=date,
        dayOfWeek="Thu",
        scenario=scenario,
        selectedCount=selected_count,
        **forecast_results
    )

@app.get("/api/ai/historical-data")
def get_historical_data(meal: Optional[str] = Query(None)):
    data = fetch_attendance_from_database()
    if meal:
        data = [d for d in data if d["meal"].lower() == meal.lower()]
    return {"status": "success", "count": len(data), "data": data}

@app.get("/api/ai/anomalies", response_model=dict)
def get_anomalies():
    url = f"{BACKEND_API_URL}/ai/anomalies"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SmartMess-AI/2.1"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                body = json.loads(response.read().decode("utf-8"))
                return {"status": "success", "anomalies": body.get("anomalies", [])}
    except Exception as e:
        print(f"Error fetching anomalies from {url}: {e}")
    return {"status": "error", "message": "Database anomalies unavailable", "anomalies": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
