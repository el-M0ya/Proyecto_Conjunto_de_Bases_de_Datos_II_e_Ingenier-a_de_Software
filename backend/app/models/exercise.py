"""
Modelo de Ejercicio.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class ExerciseType(str, enum.Enum):
    FUERZA = "FUERZA"
    CARDIO = "CARDIO"
    FLEXIBILIDAD = "FLEXIBILIDAD"


class IntensityLevel(str, enum.Enum):
    BAJO = "BAJO"
    MEDIO = "MEDIO"
    ALTO = "ALTO"


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(String(1000), nullable=True)
    muscle_group = Column(Enum("PECHO", "ESPALDA", "PIERNAS", "BICEPS", "TRICEPS",
                                 "HOMBROS", "ABDOMEN", "GLUTEOS", "ANTEBRAZOS",
                                 "PANTORRILLAS", "TRAPECIO", "ISQUIOTIBIALES",
                                 name="muscle_group"), nullable=False)
    type = Column(Enum(ExerciseType), nullable=False)
    intensity = Column(Enum(IntensityLevel), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    created_by = relationship("Trainer", back_populates="exercises")
    routine_exercises = relationship("RoutineExercise", back_populates="exercise")
