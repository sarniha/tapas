from fastapi import FastAPI
from app.routers import auth
from app.routers import users

from app.routers import food_logs
from app.routers import workout_logs
from app.routers import dashboard
from app.routers import check_ins










from app.core.config import settings

app = FastAPI(title="FitDiet API", version="0.1.0")


app.include_router(auth.router)


app.include_router(workout_logs.router)


app.include_router(food_logs.router)

app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(check_ins.router)




@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}