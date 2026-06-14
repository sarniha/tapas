import json
from datetime import date as date_type
from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.services.dashboard import get_dashboard

client = Groq(api_key=settings.GROQ_API_KEY)


def generate_meal_suggestions(db: Session, user: User, target_date: date_type) -> list[dict]:
    dashboard_data = get_dashboard(db, user, target_date)
    remaining = dashboard_data["remaining"]

    dietary_pref = user.dietary_preference or "no_preference"

    prompt = f"""You are a nutrition assistant. A user following a {dietary_pref} diet has these remaining macro targets for today:

Calories: {remaining['calories']:.0f} kcal
Protein: {remaining['protein']:.0f} g
Carbs: {remaining['carbs']:.0f} g
Fat: {remaining['fat']:.0f} g

Suggest 2-3 meal ideas (suitable for Indian home cooking) that would help the user hit these remaining targets. Each suggestion should roughly fit within these remaining macros (it's okay if not exact).

Respond ONLY with valid JSON, no other text, in this exact format:
{{
  "suggestions": [
    {{"id": "a", "meal_name": "...", "calories": 000, "protein_g": 00, "carbs_g": 00, "fat_g": 00}},
    {{"id": "b", "meal_name": "...", "calories": 000, "protein_g": 00, "carbs_g": 00, "fat_g": 00}}
  ]
}}"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=500,
    )

    raw_content = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(raw_content)
        suggestions = parsed["suggestions"]
    except (json.JSONDecodeError, KeyError, TypeError) as e:
        raise ValueError(f"Failed to parse LLM response as expected JSON: {e}")

    return suggestions