from datetime import date as date_type
from typing import List, Optional
from pydantic import BaseModel


class MacroValues(BaseModel):
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None


class WorkoutSummary(BaseModel):
    id: int
    workout_type: str
    duration_minutes: int
    calories_burned: Optional[float] = None


class DashboardResponse(BaseModel):
    date: date_type
    targets: MacroValues
    actual: MacroValues
    remaining: MacroValues
    workouts: List[WorkoutSummary]
    adherence_status: str