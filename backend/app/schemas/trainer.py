"""
Esquemas Pydantic para Entrenadores.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TrainerCreate(BaseModel):
    name: str
    specialty: str


class TrainerUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None


class TrainerResponse(BaseModel):
    id: str
    name: str
    specialty: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
