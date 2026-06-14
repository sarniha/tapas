from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey, Index, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.core.database import Base


class DailyCheckIn(Base):
    __tablename__ = "daily_check_ins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)

    calorie_target = Column(Float, nullable=True)
    calorie_actual = Column(Float, nullable=True)
    protein_target = Column(Float, nullable=True)
    protein_actual = Column(Float, nullable=True)
    workout_target_minutes = Column(Integer, nullable=True)
    workout_actual_minutes = Column(Integer, nullable=True)

    adherence_status = Column(String, nullable=True)
    note = Column(Text, nullable=True)
    tags = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("idx_daily_checkin_user_date", "user_id", "date", unique=True),
    )