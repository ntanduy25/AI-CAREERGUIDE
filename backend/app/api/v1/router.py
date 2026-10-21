from fastapi import APIRouter

from app.api.v1 import academic, admin, assessments, auth, health, profile, recommendations, roadmap

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(assessments.router)
api_router.include_router(academic.router)
api_router.include_router(recommendations.router)
api_router.include_router(roadmap.router)
api_router.include_router(admin.router)
