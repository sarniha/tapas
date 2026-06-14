from datetime import date as date_type
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.food_log import FoodLog
from app.models.workout_log import WorkoutLog


def get_adherence_status(actual: float, target: float) -> str:
    if target == 0:
        return "on_track"

    deviation = (actual - target) / target

    if -0.10 <= deviation <= 0.10:
        return "on_track"
    elif 0.10 < deviation <= 0.25:
        return "over"
    elif deviation > 0.25:
        return "way_over"
    elif -0.25 <= deviation < -0.10:
        return "under"
    else:  # deviation < -0.25
        return "way_under"


def get_dashboard(db: Session, user: User, target_date: date_type) -> dict:
    # Aggregate food logs for the date
    food_totals = (
        db.query(
            func.coalesce(func.sum(FoodLog.calories), 0).label("calories"),
            func.coalesce(func.sum(FoodLog.protein_g), 0).label("protein_g"),
            func.coalesce(func.sum(FoodLog.carbs_g), 0).label("carbs_g"),
            func.coalesce(func.sum(FoodLog.fat_g), 0).label("fat_g"),
        )
        .filter(
            FoodLog.user_id == user.id,
            func.date(FoodLog.logged_at) == target_date,
        )
        .first()
    )

    # Aggregate workout logs for the date
    workouts = (
        db.query(WorkoutLog)
        .filter(
            WorkoutLog.user_id == user.id,
            func.date(WorkoutLog.logged_at) == target_date,
        )
        .all()
    )

    actual_calories = float(food_totals.calories)
    actual_protein = float(food_totals.protein_g)
    actual_carbs = float(food_totals.carbs_g)
    actual_fat = float(food_totals.fat_g)

    adherence_status = get_adherence_status(actual_calories, user.daily_calorie_target or 0)

    return {
        "date": target_date,
        "targets": {
            "calories": user.daily_calorie_target,
            "protein": user.daily_protein_target,
            "carbs": user.daily_carb_target,
            "fat": user.daily_fat_target,
        },
        "actual": {
            "calories": actual_calories,
            "protein": actual_protein,
            "carbs": actual_carbs,
            "fat": actual_fat,
        },
        "remaining": {
            "calories": (user.daily_calorie_target or 0) - actual_calories,
            "protein": (user.daily_protein_target or 0) - actual_protein,
            "carbs": (user.daily_carb_target or 0) - actual_carbs,
            "fat": (user.daily_fat_target or 0) - actual_fat,
        },
        "workouts": [
            {
                "id": w.id,
                "workout_type": w.workout_type,
                "duration_minutes": w.duration_minutes,
                "calories_burned": w.calories_burned,
            }
            for w in workouts
        ],
        "adherence_status": adherence_status,
    }