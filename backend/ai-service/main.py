from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import math

app = FastAPI(
    title="Smart Mess & KFC AI Forecasting Engine",
    description="Intelligent AI Microservice for Headcount Prediction, Day-of-Week Seasonality Regression & Wastage Minimization",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    id: int
    title: str
    scope: str
    description: str
    severity: str
    metricDifference: Optional[str] = None
    actionRequired: Optional[str] = None
    mitigation: Optional[str] = None

# Historical dataset representing past 14 days of campus dining turnout
HISTORICAL_DATA = [
    {"date": "2026-09-18", "day": "Fri", "meal": "Breakfast", "selected": 168, "actual": 164, "predicted": 166, "wastageKg": 11.2, "accuracy": 96.4, "event": "Regular Academic Day"},
    {"date": "2026-09-18", "day": "Fri", "meal": "Lunch", "selected": 184, "actual": 190, "predicted": 188, "wastageKg": 9.8, "accuracy": 96.8, "event": "Regular Academic Day"},
    {"date": "2026-09-18", "day": "Fri", "meal": "Snacks", "selected": 138, "actual": 144, "predicted": 142, "wastageKg": 5.4, "accuracy": 95.8, "event": "Regular Academic Day"},
    {"date": "2026-09-18", "day": "Fri", "meal": "Dinner", "selected": 174, "actual": 176, "predicted": 175, "wastageKg": 7.2, "accuracy": 98.3, "event": "Regular Academic Day"},

    {"date": "2026-09-19", "day": "Sat", "meal": "Breakfast", "selected": 142, "actual": 136, "predicted": 138, "wastageKg": 10.4, "accuracy": 95.7, "event": "Weekend Outing"},
    {"date": "2026-09-19", "day": "Sat", "meal": "Lunch", "selected": 156, "actual": 152, "predicted": 154, "wastageKg": 8.6, "accuracy": 97.4, "event": "Weekend Outing"},
    {"date": "2026-09-19", "day": "Sat", "meal": "Snacks", "selected": 118, "actual": 124, "predicted": 122, "wastageKg": 4.8, "accuracy": 96.7, "event": "Weekend Outing"},
    {"date": "2026-09-19", "day": "Sat", "meal": "Dinner", "selected": 148, "actual": 144, "predicted": 146, "wastageKg": 6.9, "accuracy": 97.3, "event": "Weekend Outing"},

    {"date": "2026-09-20", "day": "Sun", "meal": "Breakfast", "selected": 135, "actual": 130, "predicted": 132, "wastageKg": 9.8, "accuracy": 96.2, "event": "Sunday Brunch"},
    {"date": "2026-09-20", "day": "Sun", "meal": "Lunch", "selected": 172, "actual": 178, "predicted": 176, "wastageKg": 7.4, "accuracy": 96.6, "event": "Special Sunday Feast"},
    {"date": "2026-09-20", "day": "Sun", "meal": "Snacks", "selected": 125, "actual": 132, "predicted": 130, "wastageKg": 4.2, "accuracy": 95.4, "event": "Evening Social"},
    {"date": "2026-09-20", "day": "Sun", "meal": "Dinner", "selected": 165, "actual": 168, "predicted": 167, "wastageKg": 6.1, "accuracy": 98.2, "event": "Hostel Return Rush"},

    {"date": "2026-09-21", "day": "Mon", "meal": "Breakfast", "selected": 172, "actual": 168, "predicted": 170, "wastageKg": 12.0, "accuracy": 97.6, "event": "Monday Morning Start"},
    {"date": "2026-09-21", "day": "Mon", "meal": "Lunch", "selected": 188, "actual": 194, "predicted": 192, "wastageKg": 10.5, "accuracy": 97.9, "event": "Full Attendance"},
    {"date": "2026-09-21", "day": "Mon", "meal": "Snacks", "selected": 142, "actual": 148, "predicted": 146, "wastageKg": 5.6, "accuracy": 97.3, "event": "Regular Academic Day"},
    {"date": "2026-09-21", "day": "Mon", "meal": "Dinner", "selected": 178, "actual": 182, "predicted": 180, "wastageKg": 8.2, "accuracy": 97.8, "event": "Regular Academic Day"},

    {"date": "2026-09-22", "day": "Tue", "meal": "Breakfast", "selected": 169, "actual": 166, "predicted": 167, "wastageKg": 11.5, "accuracy": 98.2, "event": "Regular Academic Day"},
    {"date": "2026-09-22", "day": "Tue", "meal": "Lunch", "selected": 186, "actual": 191, "predicted": 189, "wastageKg": 9.9, "accuracy": 97.9, "event": "Regular Academic Day"},
    {"date": "2026-09-22", "day": "Tue", "meal": "Snacks", "selected": 140, "actual": 145, "predicted": 144, "wastageKg": 5.2, "accuracy": 97.9, "event": "Regular Academic Day"},
    {"date": "2026-09-22", "day": "Tue", "meal": "Dinner", "selected": 176, "actual": 179, "predicted": 178, "wastageKg": 7.8, "accuracy": 98.3, "event": "Regular Academic Day"},

    {"date": "2026-09-23", "day": "Wed", "meal": "Breakfast", "selected": 170, "actual": 167, "predicted": 168, "wastageKg": 10.2, "accuracy": 97.6, "event": "Regular Academic Day"},
    {"date": "2026-09-23", "day": "Wed", "meal": "Lunch", "selected": 192, "actual": 201, "predicted": 198, "wastageKg": 8.5, "accuracy": 97.0, "event": "Mid-Week Special Menu"},
    {"date": "2026-09-23", "day": "Wed", "meal": "Snacks", "selected": 145, "actual": 152, "predicted": 150, "wastageKg": 4.9, "accuracy": 96.7, "event": "Regular Academic Day"},
    {"date": "2026-09-23", "day": "Wed", "meal": "Dinner", "selected": 182, "actual": 188, "predicted": 186, "wastageKg": 6.8, "accuracy": 97.8, "event": "Special Dinner Shift"},

    {"date": "2026-09-24", "day": "Thu", "meal": "Breakfast", "selected": 166, "actual": 162, "predicted": 164, "wastageKg": 9.6, "accuracy": 97.6, "event": "Smart Prep Benchmark"},
    {"date": "2026-09-24", "day": "Thu", "meal": "Lunch", "selected": 185, "actual": 192, "predicted": 190, "wastageKg": 8.6, "accuracy": 97.9, "event": "Smart Prep Benchmark"},
    {"date": "2026-09-24", "day": "Thu", "meal": "Snacks", "selected": 139, "actual": 146, "predicted": 144, "wastageKg": 4.6, "accuracy": 97.2, "event": "Smart Prep Benchmark"},
    {"date": "2026-09-24", "day": "Thu", "meal": "Dinner", "selected": 175, "actual": 180, "predicted": 178, "wastageKg": 6.2, "accuracy": 97.8, "event": "Smart Prep Benchmark"},

    {"date": "2026-09-25", "day": "Fri", "meal": "Breakfast", "selected": 167, "actual": 164, "predicted": 165, "wastageKg": 8.8, "accuracy": 98.2, "event": "Regular Academic Day"},
    {"date": "2026-09-25", "day": "Fri", "meal": "Lunch", "selected": 184, "actual": 191, "predicted": 189, "wastageKg": 7.9, "accuracy": 97.9, "event": "Regular Academic Day"},
    {"date": "2026-09-25", "day": "Fri", "meal": "Snacks", "selected": 146, "actual": 158, "predicted": 154, "wastageKg": 4.1, "accuracy": 96.1, "event": "Rainy Day Samosa Rush"},
    {"date": "2026-09-25", "day": "Fri", "meal": "Dinner", "selected": 179, "actual": 185, "predicted": 183, "wastageKg": 5.7, "accuracy": 97.8, "event": "Rainy Evening Stay"},

    {"date": "2026-09-26", "day": "Sat", "meal": "Breakfast", "selected": 145, "actual": 138, "predicted": 140, "wastageKg": 7.2, "accuracy": 96.4, "event": "Weekend Outing"},
    {"date": "2026-09-26", "day": "Sat", "meal": "Lunch", "selected": 160, "actual": 156, "predicted": 158, "wastageKg": 6.5, "accuracy": 97.5, "event": "Weekend Outing"},
    {"date": "2026-09-26", "day": "Sat", "meal": "Snacks", "selected": 122, "actual": 129, "predicted": 126, "wastageKg": 3.8, "accuracy": 96.0, "event": "Weekend Outing"},
    {"date": "2026-09-26", "day": "Sat", "meal": "Dinner", "selected": 152, "actual": 149, "predicted": 150, "wastageKg": 5.1, "accuracy": 98.0, "event": "Weekend Outing"},

    {"date": "2026-09-27", "day": "Sun", "meal": "Breakfast", "selected": 138, "actual": 134, "predicted": 135, "wastageKg": 6.8, "accuracy": 97.8, "event": "Sunday Brunch"},
    {"date": "2026-09-27", "day": "Sun", "meal": "Lunch", "selected": 175, "actual": 181, "predicted": 179, "wastageKg": 5.9, "accuracy": 97.8, "event": "Biryani Special"},
    {"date": "2026-09-27", "day": "Sun", "meal": "Snacks", "selected": 128, "actual": 135, "predicted": 133, "wastageKg": 3.4, "accuracy": 97.0, "event": "Evening Tea"},
    {"date": "2026-09-27", "day": "Sun", "meal": "Dinner", "selected": 168, "actual": 172, "predicted": 170, "wastageKg": 4.8, "accuracy": 97.7, "event": "Sunday Return Rush"},

    {"date": "2026-09-28", "day": "Mon", "meal": "Breakfast", "selected": 170, "actual": 168, "predicted": 169, "wastageKg": 6.4, "accuracy": 98.8, "event": "Optimal AI Batch Prep"},
    {"date": "2026-09-28", "day": "Mon", "meal": "Lunch", "selected": 187, "actual": 193, "predicted": 191, "wastageKg": 5.6, "accuracy": 97.9, "event": "Optimal AI Batch Prep"},
    {"date": "2026-09-28", "day": "Mon", "meal": "Snacks", "selected": 141, "actual": 147, "predicted": 145, "wastageKg": 3.2, "accuracy": 97.2, "event": "Optimal AI Batch Prep"},
    {"date": "2026-09-28", "day": "Mon", "meal": "Dinner", "selected": 177, "actual": 181, "predicted": 179, "wastageKg": 4.5, "accuracy": 97.8, "event": "Optimal AI Batch Prep"},

    {"date": "2026-09-29", "day": "Tue", "meal": "Breakfast", "selected": 171, "actual": 169, "predicted": 170, "wastageKg": 5.8, "accuracy": 98.8, "event": "Optimal AI Batch Prep"},
    {"date": "2026-09-29", "day": "Tue", "meal": "Lunch", "selected": 188, "actual": 194, "predicted": 192, "wastageKg": 5.2, "accuracy": 97.9, "event": "Optimal AI Batch Prep"},
    {"date": "2026-09-29", "day": "Tue", "meal": "Snacks", "selected": 143, "actual": 149, "predicted": 147, "wastageKg": 3.0, "accuracy": 97.3, "event": "Optimal AI Batch Prep"},
    {"date": "2026-09-29", "day": "Tue", "meal": "Dinner", "selected": 178, "actual": 182, "predicted": 180, "wastageKg": 4.2, "accuracy": 97.8, "event": "Optimal AI Batch Prep"},

    {"date": "2026-09-30", "day": "Wed", "meal": "Breakfast", "selected": 169, "actual": 167, "predicted": 168, "wastageKg": 5.4, "accuracy": 98.8, "event": "Optimal AI Batch Prep"},
    {"date": "2026-09-30", "day": "Wed", "meal": "Lunch", "selected": 189, "actual": 196, "predicted": 194, "wastageKg": 4.9, "accuracy": 97.9, "event": "Paneer Butter Masala Peak"},
    {"date": "2026-09-30", "day": "Wed", "meal": "Snacks", "selected": 142, "actual": 148, "predicted": 146, "wastageKg": 2.8, "accuracy": 97.3, "event": "Optimal AI Batch Prep"},
    {"date": "2026-09-30", "day": "Wed", "meal": "Dinner", "selected": 180, "actual": 185, "predicted": 183, "wastageKg": 3.9, "accuracy": 97.8, "event": "Optimal AI Batch Prep"},

    {"date": "2026-10-01", "day": "Thu", "meal": "Breakfast", "selected": 169, "actual": 172, "predicted": 175, "wastageKg": 5.1, "accuracy": 98.3, "event": "Current Day Active"},
    {"date": "2026-10-01", "day": "Thu", "meal": "Lunch", "selected": 185, "actual": 192, "predicted": 192, "wastageKg": 4.8, "accuracy": 98.9, "event": "Current Day Active"},
    {"date": "2026-10-01", "day": "Thu", "meal": "Snacks", "selected": 140, "actual": 145, "predicted": 148, "wastageKg": 2.6, "accuracy": 97.9, "event": "Current Day Active"},
    {"date": "2026-10-01", "day": "Thu", "meal": "Dinner", "selected": 178, "actual": 180, "predicted": 184, "wastageKg": 3.6, "accuracy": 97.8, "event": "Current Day Active"}
]

def run_forecast_model(meal: str, selected_count: int, day_of_week: str = "Thu", scenario: str = "standard") -> Dict[str, Any]:
    meal_records = [h for h in HISTORICAL_DATA if h["meal"].lower() == meal.lower()]
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
        "version": "2.0.0",
        "algorithm": "Weighted Moving Average (WMA) + Day-of-Week Seasonality + Intent Regression",
        "endpoints": ["/api/ai/forecast/{scope}/{date}", "/api/ai/anomalies", "/api/ai/historical-data"]
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
    data = HISTORICAL_DATA
    if meal:
        data = [d for d in HISTORICAL_DATA if d["meal"].lower() == meal.lower()]
    return {"status": "success", "count": len(data), "data": data}

@app.get("/api/ai/anomalies", response_model=dict)
def get_anomalies():
    anomalies: List[Anomaly] = [
        Anomaly(
            id=1,
            title="Thursday Lunch Turnout Surge Forecast",
            scope="Main Mess Kitchen • Lunch Shift",
            description="Historical 14-day analysis indicates Thursday Lunch turnout averages +4.2% over portal selections due to 3rd-year engineering lab schedules. Recommended: Prepare +8 buffer portions.",
            severity="medium",
            metricDifference="+7.4 meals vs selections",
            actionRequired="Apply Kitchen Buffer Margin",
            mitigation="Add +3.5 kg rice and +2.5 kg dal to Lunch prep"
        ),
        Anomaly(
            id=2,
            title="Room D-202 Participation Lag",
            scope="Hostel Block D • Floor 2 (Room D-202)",
            description="Room D-202 submission rate is 60% (3/5 students). 2 students have not opted in before the 10:00 PM cutoff. Automated nudge dispatched.",
            severity="high",
            metricDifference="-40% vs Floor Target",
            actionRequired="Follow up with Room Lead",
            mitigation="Automated nudge dispatched to Room Lead & Floor Incharge"
        ),
        Anomaly(
            id=3,
            title="KFC Express Evening Rush Alert",
            scope="Canteen Food Court • 04:30 PM - 06:00 PM",
            description="Zinger Burger Duo & Chicken Popcorn orders predicted to surge by +28% based on previous Thursday evening footfall.",
            severity="medium",
            metricDifference="+28% Order Volume",
            actionRequired="Pre-marinate chicken stock",
            mitigation="Pre-batch 15 extra fryer portions"
        ),
        Anomaly(
            id=4,
            title="Zero Waste Milestone - International Wing",
            scope="Block E International Kitchen Wing",
            description="Daily unconsumed plate wastage dropped by 32% (from 18.2kg Mon down to 4.8kg today) after adopting AI-guided portioning.",
            severity="low",
            metricDifference="-32% Plate Waste",
            actionRequired="Maintain AI Batching",
            mitigation="Benchmark adopted campus-wide"
        )
    ]
    return {"status": "success", "anomalies": anomalies}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
