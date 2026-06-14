from datetime import date as date_type, datetime
from typing import Optional, List
from pydantic import BaseModel


class CheckInCreate(BaseModel):
    date: date_type
    note: Optional[str] = None
    tags: Optional[List[str]] = None


class CheckInUpdate(BaseModel):
    note: Optional[str] = None
    tags: Optional[List[str]] = None


class CheckInResponse(BaseModel):
    id: int
    date: date_type
    calorie_target: Optional[float] = None
    calorie_actual: Optional[float] = None
    protein_target: Optional[float] = None
    protein_actual: Optional[float] = None
    workout_target_minutes: Optional[int] = None
    workout_actual_minutes: Optional[int] = None
    adherence_status: Optional[str] = None
    note: Optional[str] = None
    tags: Optional[List[str]] = None

    class Config:
        from_attributes = True


class PaginatedCheckIns(BaseModel):
    items: List[CheckInResponse]
    total: int
    page: int
    page_size: int