from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth
from app.routers import users
from app.routers import food_logs
from app.routers import workout_logs
from app.routers import dashboard
from app.routers import check_ins
from app.routers import recommendations
from app.core.config import settings

app = FastAPI(title="FitDiet API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(food_logs.router)
app.include_router(workout_logs.router)
app.include_router(dashboard.router)
app.include_router(check_ins.router)
app.include_router(recommendations.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}