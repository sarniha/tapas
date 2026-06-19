from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import (
    OnboardingRequest,
    TargetsResponse,
    UserProfileResponse,
    UserUpdateRequest,
)
from app.services.calorie_calc import calculate_targets

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.post("/me/onboarding", response_model=TargetsResponse)
def onboarding(
    payload: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    targets = calculate_targets(
        weight_kg=payload.weight_kg,
        height_cm=payload.height_cm,
        age=payload.age,
        gender=payload.gender,
        activity_level=payload.activity_level,
        goal=payload.goal,
    )

    for field, value in payload.model_dump().items():
        setattr(current_user, field, value)
    for field, value in targets.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return TargetsResponse(**targets)


@router.get("/me", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserProfileResponse)
def update_profile(
    payload: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    # Recompute targets if any field affecting calculation changed
    recalc_fields = {"weight_kg", "height_cm", "age", "gender", "activity_level", "goal"}
    if recalc_fields & update_data.keys():
        targets = calculate_targets(
            weight_kg=current_user.weight_kg,
            height_cm=current_user.height_cm,
            age=current_user.age,
            gender=current_user.gender,
            activity_level=current_user.activity_level,
            goal=current_user.goal,
        )
        for field, value in targets.items():
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/me/onboarding", response_model=TargetsResponse)
def onboarding(
    payload: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    targets = calculate_targets(
        weight_kg=payload.weight_kg,
        height_cm=payload.height_cm,
        age=payload.age,
        gender=payload.gender,
        activity_level=payload.activity_level,
        goal=payload.goal,
    )

    for field, value in payload.model_dump().items():
        setattr(current_user, field, value)
    for field, value in targets.items():
        setattr(current_user, field, value)

    current_user.is_onboarded = True  # ADD THIS LINE

    db.commit()
    db.refresh(current_user)

    return TargetsResponse(**targets)    