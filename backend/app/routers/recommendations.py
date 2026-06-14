from datetime import date as date_type, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.ai_recommendation import AIRecommendation
from app.schemas.ai_recommendation import (
    AIRecommendationResponse,
    FollowSuggestionRequest,
)
from app.services.ai_recommendation import generate_meal_suggestions

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])


@router.post("/meal-suggestion", response_model=AIRecommendationResponse)
def create_meal_suggestion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date_type.today()

    try:
        suggestions = generate_meal_suggestions(db, current_user, today)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI service error: {e}")

    existing = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.user_id == current_user.id, AIRecommendation.date == today)
        .first()
    )

    if existing:
        existing.suggestions = suggestions
        existing.followed_suggestion_id = None
        existing.followed_at = None
        db.commit()
        db.refresh(existing)
        return existing

    rec = AIRecommendation(
        user_id=current_user.id,
        date=today,
        suggestions=suggestions,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.get("/today", response_model=AIRecommendationResponse)
def get_today_recommendation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date_type.today()
    rec = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.user_id == current_user.id, AIRecommendation.date == today)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No recommendation generated for today yet")
    return rec


@router.patch("/{rec_id}/follow", response_model=AIRecommendationResponse)
def follow_suggestion(
    rec_id: int,
    payload: FollowSuggestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rec = (
        db.query(AIRecommendation)
        .filter(AIRecommendation.id == rec_id, AIRecommendation.user_id == current_user.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")

    valid_ids = {s["id"] for s in rec.suggestions}
    if payload.followed_suggestion_id not in valid_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid suggestion id")

    rec.followed_suggestion_id = payload.followed_suggestion_id
    rec.followed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(rec)
    return rec