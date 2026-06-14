from datetime import date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard import get_dashboard

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def dashboard(
    date: Optional[date_type] = Query(None, description="Defaults to today (UTC)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_date = date or date_type.today()
    return get_dashboard(db, current_user, target_date)