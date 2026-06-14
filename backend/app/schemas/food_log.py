from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class FoodLogCreate(BaseModel):
    food_name: str
    calories: float
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    meal_type: str
    logged_at: datetime


class FoodLogUpdate(BaseModel):
    food_name: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    meal_type: Optional[str] = None
    logged_at: Optional[datetime] = None


class FoodLogResponse(BaseModel):
    id: int
    food_name: str
    calories: float
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    meal_type: str
    logged_at: datetime

    class Config:
        from_attributes = True


class PaginatedFoodLogs(BaseModel):
    items: List[FoodLogResponse]
    total: int
    page: int
    page_size: int