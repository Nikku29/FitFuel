from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import datetime
import math

app = FastAPI(
    title="FitFuel Analytics Engine",
    description="High-performance Python microservice for crunching user fitness data",
    version="1.0.0"
)

# Models
class ExerciseLog(BaseModel):
    name: str
    sets: int
    reps: str
    duration_seconds: int
    weight_kg: float = 0.0

class WorkoutSession(BaseModel):
    user_id: str
    session_id: str
    date: datetime.date
    exercises: List[ExerciseLog]

class AnalyticsResponse(BaseModel):
    total_volume_kg: float
    estimated_calories: int
    muscle_group_distribution: Dict[str, float]
    fatigue_index: float

@app.get("/")
def read_root():
    return {"status": "online", "service": "FitFuel Python Analytics Engine"}

@app.post("/api/v1/analyze", response_model=AnalyticsResponse)
async def analyze_session(session: WorkoutSession):
    """
    Simulates advanced statistical analysis of a workout session.
    Calculates total volume, caloric burn via MET approximations, and a proprietary fatigue index.
    """
    if not session.exercises:
        raise HTTPException(status_code=400, detail="Workout must contain exercises for analysis.")

    total_volume = 0.0
    total_duration_secs = 0
    muscle_groups = {"chest": 0.0, "back": 0.0, "legs": 0.0, "core": 0.0, "arms": 0.0}

    for ex in session.exercises:
        # Calculate volume load (Sets * standard reps * weight)
        # Assuming an average of 10 if string is complex like '8-12'
        try:
            avg_reps = sum([int(x) for x in ex.reps.split('-')]) / len(ex.reps.split('-'))
        except:
            avg_reps = 10.0

        volume = ex.sets * avg_reps * ex.weight_kg
        total_volume += volume
        total_duration_secs += ex.duration_seconds

        # Extremely simplified heuristic mapping for demo
        ex_lower = ex.name.lower()
        if "press" in ex_lower or "push" in ex_lower:
            muscle_groups["chest"] += volume
        elif "row" in ex_lower or "pull" in ex_lower:
            muscle_groups["back"] += volume
        elif "squat" in ex_lower or "leg" in ex_lower or "lunge" in ex_lower:
            muscle_groups["legs"] += volume
        elif "curl" in ex_lower or "extension" in ex_lower:
            muscle_groups["arms"] += volume
        else:
            muscle_groups["core"] += volume

    minutes = total_duration_secs / 60.0
    # Rough estimate calculation
    estimated_calories = int(minutes * 6.5)

    # Calculate percentages
    if total_volume > 0:
        for k in muscle_groups:
            muscle_groups[k] = round((muscle_groups[k] / total_volume) * 100, 2)

    # Proprietary fatigue index (0.0 to 10.0)
    fatigue_index = min(10.0, round(math.log(max(1, total_volume)) * (total_duration_secs/3600), 2))

    return AnalyticsResponse(
        total_volume_kg=total_volume,
        estimated_calories=estimated_calories,
        muscle_group_distribution=muscle_groups,
        fatigue_index=fatigue_index
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
