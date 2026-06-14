from datetime import datetime, timezone, date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.workout_log import WorkoutLog
from app.schemas.workout_log import (
    WorkoutLogCreate,
    WorkoutLogUpdate,
    WorkoutLogResponse,
    PaginatedWorkoutLogs,
)

router = APIRouter(prefix="/api/v1/workout-logs", tags=["workout-logs"])


@router.post("", response_model=WorkoutLogResponse, status_code=status.HTTP_201_CREATED)
def create_workout_log(
    payload: WorkoutLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.logged_at > datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="logged_at cannot be in the future")

    workout_log = WorkoutLog(user_id=current_user.id, **payload.model_dump())
    db.add(workout_log)
    db.commit()
    db.refresh(workout_log)
    return workout_log


@router.get("", response_model=PaginatedWorkoutLogs)
def list_workout_logs(
    date: Optional[date_type] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(WorkoutLog).filter(WorkoutLog.user_id == current_user.id)

    if date:
        query = query.filter(func.date(WorkoutLog.logged_at) == date)

    total = query.count()
    items = (
        query.order_by(WorkoutLog.logged_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedWorkoutLogs(items=items, total=total, page=page, page_size=page_size)


@router.patch("/{workout_log_id}", response_model=WorkoutLogResponse)
def update_workout_log(
    workout_log_id: int,
    payload: WorkoutLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workout_log = (
        db.query(WorkoutLog)
        .filter(WorkoutLog.id == workout_log_id, WorkoutLog.user_id == current_user.id)
        .first()
    )
    if not workout_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout log not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workout_log, field, value)

    db.commit()
    db.refresh(workout_log)
    return workout_log


@router.delete("/{workout_log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout_log(
    workout_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workout_log = (
        db.query(WorkoutLog)
        .filter(WorkoutLog.id == workout_log_id, WorkoutLog.user_id == current_user.id)
        .first()
    )
    if not workout_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout log not found")

    db.delete(workout_log)
    db.commit()
    return None