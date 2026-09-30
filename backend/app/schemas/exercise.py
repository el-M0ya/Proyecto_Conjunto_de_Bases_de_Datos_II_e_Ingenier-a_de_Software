"""
Esquemas Pydantic para Ejercicios.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class MuscleGroup(str, Enum):
    PECHO = "PECHO"
    ESPALDA = "ESPALDA"
    PIERNAS = "PIERNAS"
    BICEPS = "BICEPS"
    TRICEPS = "TRICEPS"
    HOMBROS = "HOMBROS"
    ABDOMEN = "ABDOMEN"
    GLUTEOS = "GLUTEOS"
    ANTEBRAZOS = "ANTEBRAZOS"
    PANTORRILLAS = "PANTORRILLAS"
    TRAPECIO = "TRAPECIO"
    ISQUIOTIBIALES = "ISQUIOTIBIALES"


class ExerciseType(str, Enum):
    FUERZA = "FUERZA"
    CARDIO = "CARDIO"
    FLEXIBILIDAD = "FLEXIBILIDAD"


class IntensityLevel(str, Enum):
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"


class ExerciseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    muscle_group: MuscleGroup
    type: ExerciseType
    intensity: IntensityLevel
    created_by_id: str


class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    muscle_group: Optional[MuscleGroup] = None
    type: Optional[ExerciseType] = None
    intensity: Optional[IntensityLevel] = None


class ExerciseResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    muscle_group: str
    type: str
    intensity: str
    created_by_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
