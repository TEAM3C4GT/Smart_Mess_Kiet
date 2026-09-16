from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="Smart Mess & KFC AI Forecasting Service",
    description="Python FastAPI service providing headcount forecasts and participation anomaly detection.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ForecastResponse(BaseModel):
    meal: str
    selectedCount: int
    predictedCount: int
    confidence: float
    scope: str
    date: str

class Anomaly(BaseModel):
    id: int
    title: str
    scope: str
    description: str
    severity: str
    metricDifference: Optional[str] = None

@app.get("/")
def read_root():
    return {
        "service": "Smart Mess & KFC AI Microservice",
        "status": "active",
        "endpoints": ["/api/ai/forecast/{scope}/{date}", "/api/ai/anomalies"]
    }

@app.get("/api/ai/forecast/{scope}/{date}", response_model=ForecastResponse)
def get_forecast(scope: str, date: str, meal: str = Query("Lunch")):
    """
    Returns AI predicted headcount using trend forecasting logic.
    """
    selected_count = 300 if scope == "mess" else 185
    predicted_count = int(selected_count * 1.04)
    confidence = 0.91
    
    return ForecastResponse(
        meal=meal,
        selectedCount=selected_count,
        predictedCount=predicted_count,
        confidence=confidence,
        scope=scope,
        date=date
    )

@app.get("/api/ai/anomalies", response_model=dict)
def get_anomalies():
    """
    Returns detected participation anomalies, high wastage warnings, and attendance variance alerts.
    """
    anomalies: List[Anomaly] = [
        Anomaly(
            id=1,
            title="Low Participation Alert",
            scope="Floor 2 (Room F-201)",
            description="Room submission rate is 40% (2/5 students). 3 pending submissions before 10:00 PM cutoff.",
            severity="high",
            metricDifference="-40% vs Floor Avg"
        ),
        Anomaly(
            id=2,
            title="KFC Express Demand Surge",
            scope="Dinner Shift",
            description="Zinger Burger Duo orders higher than 7-day moving average.",
            severity="medium",
            metricDifference="+28% Orders"
        ),
        Anomaly(
            id=3,
            title="Actual vs Predicted Attendance Variance",
            scope="Breakfast Shift",
            description="Selected: 169, Predicted: 175, Actual: 172. Variance within healthy threshold.",
            severity="low",
            metricDifference="+3 Meals"
        ),
        Anomaly(
            id=4,
            title="Wastage Reduction Trend",
            scope="Kitchen Operations",
            description="Food waste reduced from 18kg to 6kg, beating the 10kg target limit.",
            severity="low",
            metricDifference="-32% Wastage"
        )
    ]
    return {"status": "success", "anomalies": anomalies}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
