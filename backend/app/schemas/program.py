"""
Esquemas Pydantic para Programas.
"""
from pydantic import BaseModel
from typing import Optional, List
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


class ProgramCreate(BaseModel):
    name: str
    objective: str
    muscle_groups: List[MuscleGroup]


class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    objective: Optional[str] = None
    muscle_groups: Optional[List[MuscleGroup]] = None


class ProgramResponse(BaseModel):
    id: str
    name: str
    objective: str
    muscle_groups: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
