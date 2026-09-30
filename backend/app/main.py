"""
Aplicación principal del backend FastAPI.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api.router import api_router

# Crear tablas en PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gym Training API",
    description="API para gestión de planes de entrenamiento",
    version="1.0.0",
)

# CORS - Permite que el frontend React haga peticiones
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Puerto de Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar todos los endpoints
app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "Gym Training API - OK"}


@app.get("/health")
def health():
    return {"status": "ok"}
