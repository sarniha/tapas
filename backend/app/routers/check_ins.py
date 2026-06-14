from datetime import date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.daily_check_in import DailyCheckIn
from app.models.workout_log import WorkoutLog
from app.schemas.daily_check_in import (
    CheckInCreate,
    CheckInUpdate,
    CheckInResponse,
    PaginatedCheckIns,
)
from app.services.dashboard import get_dashboard

router = APIRouter(prefix="/api/v1/check-ins", tags=["check-ins"])


@router.post("", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
def create_check_in(
    payload: CheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(DailyCheckIn)
        .filter(DailyCheckIn.user_id == current_user.id, DailyCheckIn.date == payload.date)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Check-in for this date already exists")

    dashboard_data = get_dashboard(db, current_user, payload.date)

    workout_minutes = (
        db.query(func.coalesce(func.sum(WorkoutLog.duration_minutes), 0))
        .filter(WorkoutLog.user_id == current_user.id, func.date(WorkoutLog.logged_at) == payload.date)
        .scalar()
    )

    check_in = DailyCheckIn(
        user_id=current_user.id,
        date=payload.date,
        calorie_target=dashboard_data["targets"]["calories"],
        calorie_actual=dashboard_data["actual"]["calories"],
        protein_target=dashboard_data["targets"]["protein"],
        protein_actual=dashboard_data["actual"]["protein"],
        workout_actual_minutes=workout_minutes,
        adherence_status=dashboard_data["adherence_status"],
        note=payload.note,
        tags=payload.tags,
    )
    db.add(check_in)
    db.commit()
    db.refresh(check_in)
    return check_in


@router.get("", response_model=PaginatedCheckIns)
def list_check_ins(
    start_date: Optional[date_type] = Query(None),
    end_date: Optional[date_type] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(DailyCheckIn).filter(DailyCheckIn.user_id == current_user.id)

    if start_date:
        query = query.filter(DailyCheckIn.date >= start_date)
    if end_date:
        query = query.filter(DailyCheckIn.date <= end_date)

    total = query.count()
    items = (
        query.order_by(DailyCheckIn.date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedCheckIns(items=items, total=total, page=page, page_size=page_size)


@router.patch("/{check_in_id}", response_model=CheckInResponse)
def update_check_in(
    check_in_id: int,
    payload: CheckInUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_in = (
        db.query(DailyCheckIn)
        .filter(DailyCheckIn.id == check_in_id, DailyCheckIn.user_id == current_user.id)
        .first()
    )
    if not check_in:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Check-in not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(check_in, field, value)

    db.commit()
    db.refresh(check_in)
    return check_in