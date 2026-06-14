from datetime import datetime, timezone, date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.food_log import FoodLog
from app.schemas.food_log import FoodLogCreate, FoodLogUpdate, FoodLogResponse, PaginatedFoodLogs

router = APIRouter(prefix="/api/v1/food-logs", tags=["food-logs"])


@router.post("", response_model=FoodLogResponse, status_code=status.HTTP_201_CREATED)
def create_food_log(
    payload: FoodLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.logged_at > datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="logged_at cannot be in the future")

    food_log = FoodLog(user_id=current_user.id, **payload.model_dump())
    db.add(food_log)
    db.commit()
    db.refresh(food_log)
    return food_log


@router.get("", response_model=PaginatedFoodLogs)
def list_food_logs(
    date: Optional[date_type] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(FoodLog).filter(FoodLog.user_id == current_user.id)

    if date:
        query = query.filter(func.date(FoodLog.logged_at) == date)

    total = query.count()
    items = (
        query.order_by(FoodLog.logged_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedFoodLogs(items=items, total=total, page=page, page_size=page_size)


@router.patch("/{food_log_id}", response_model=FoodLogResponse)
def update_food_log(
    food_log_id: int,
    payload: FoodLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    food_log = (
        db.query(FoodLog)
        .filter(FoodLog.id == food_log_id, FoodLog.user_id == current_user.id)
        .first()
    )
    if not food_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food log not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(food_log, field, value)

    db.commit()
    db.refresh(food_log)
    return food_log


@router.delete("/{food_log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food_log(
    food_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    food_log = (
        db.query(FoodLog)
        .filter(FoodLog.id == food_log_id, FoodLog.user_id == current_user.id)
        .first()
    )
    if not food_log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food log not found")

    db.delete(food_log)
    db.commit()
    return None