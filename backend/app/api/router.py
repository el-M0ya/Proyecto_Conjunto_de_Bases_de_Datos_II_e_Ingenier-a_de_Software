"""
Router principal de la API.
Agrupa todos los endpoints del sistema.
"""
from fastapi import APIRouter
from app.api.endpoints import exercises_router, programs_router, trainers_router, clients_router

api_router = APIRouter()

api_router.include_router(exercises_router)
api_router.include_router(programs_router)
api_router.include_router(trainers_router)
api_router.include_router(clients_router)
