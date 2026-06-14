from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)

    # Profile fields — nullable, filled during onboarding (Day 3)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    activity_level = Column(String, nullable=True)
    goal = Column(String, nullable=True)
    dietary_preference = Column(String, nullable=True)

    daily_calorie_target = Column(Float, nullable=True)
    daily_protein_target = Column(Float, nullable=True)
    daily_carb_target = Column(Float, nullable=True)
    daily_fat_target = Column(Float, nullable=True)

    device_push_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())