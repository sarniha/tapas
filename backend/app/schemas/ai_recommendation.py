from datetime import date as date_type, datetime
from typing import List, Optional
from pydantic import BaseModel


class MealSuggestion(BaseModel):
    id: str
    meal_name: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float


class AIRecommendationResponse(BaseModel):
    id: int
    date: date_type
    suggestions: List[MealSuggestion]
    followed_suggestion_id: Optional[str] = None
    followed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FollowSuggestionRequest(BaseModel):
    followed_suggestion_id: str