ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

GOAL_ADJUSTMENTS = {
    "lose": -500,
    "maintain": 0,
    "gain": 300,
}


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """Mifflin-St Jeor Equation"""
    if gender == "male":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:  # female or other — use female formula as baseline
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161


def calculate_targets(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: str,
    goal: str,
) -> dict:
    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = bmr * ACTIVITY_MULTIPLIERS[activity_level]
    calorie_target = tdee + GOAL_ADJUSTMENTS[goal]

    # Macro split: protein 30%, carbs 40%, fat 30% (standard balanced split)
    protein_target = (calorie_target * 0.30) / 4   # 4 cal/g protein
    carb_target = (calorie_target * 0.40) / 4      # 4 cal/g carbs
    fat_target = (calorie_target * 0.30) / 9       # 9 cal/g fat

    return {
        "daily_calorie_target": round(calorie_target, 2),
        "daily_protein_target": round(protein_target, 2),
        "daily_carb_target": round(carb_target, 2),
        "daily_fat_target": round(fat_target, 2),
    }