from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class WorkoutLogCreate(BaseModel):
    workout_type: str
    duration_minutes: int
    calories_burned: Optional[float] = None
    logged_at: datetime


class WorkoutLogUpdate(BaseModel):
    workout_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[float] = None
    logged_at: Optional[datetime] = None


class WorkoutLogResponse(BaseModel):
    id: int
    workout_type: str
    duration_minutes: int
    calories_burned: Optional[float] = None
    logged_at: datetime

    class Config:
        from_attributes = True


class PaginatedWorkoutLogs(BaseModel):
    items: List[WorkoutLogResponse]
    total: int
    page: int
    page_size: int