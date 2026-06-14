from typing import Optional
from pydantic import BaseModel


class OnboardingRequest(BaseModel):
    age: int
    gender: str          # "male" | "female" | "other"
    height_cm: float
    weight_kg: float
    activity_level: str  # "sedentary" | "light" | "moderate" | "active" | "very_active"
    goal: str             # "lose" | "maintain" | "gain"
    dietary_preference: str  # "vegetarian" | "vegan" | "non_vegetarian" | "eggetarian" | "no_preference"


class TargetsResponse(BaseModel):
    daily_calorie_target: float
    daily_protein_target: float
    daily_carb_target: float
    daily_fat_target: float


class UserProfileResponse(BaseModel):
    id: int
    email: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None
    dietary_preference: Optional[str] = None
    daily_calorie_target: Optional[float] = None
    daily_protein_target: Optional[float] = None
    daily_carb_target: Optional[float] = None
    daily_fat_target: Optional[float] = None

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None
    dietary_preference: Optional[str] = None