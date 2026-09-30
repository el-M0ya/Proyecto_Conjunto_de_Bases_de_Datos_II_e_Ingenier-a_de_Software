"""
Modelo de Rutina y RutinaEjercicio.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class RoutineStatus(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    APROBADA = "APROBADA"
    RECHAZADA = "RECHAZADA"
    EN_REVISION = "EN_REVISION"


class Routine(Base):
    __tablename__ = "routines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    status = Column(Enum(RoutineStatus), default=RoutineStatus.PENDIENTE)
    parameters = Column(JSON, nullable=False)  # Parámetros de generación
    blocks = Column(JSON, nullable=False)  # Estructura variable de bloques
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    program_id = Column(UUID(as_uuid=True), ForeignKey("programs.id"), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id"), nullable=False)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id"), nullable=True)

    program = relationship("Program", back_populates="routines")
    creator = relationship("Trainer", foreign_keys=[creator_id], back_populates="routines_created")
    reviewer = relationship("Trainer", foreign_keys=[reviewer_id], back_populates="routines_reviewed")
    exercises = relationship("RoutineExercise", back_populates="routine", cascade="all, delete-orphan")
    client_routines = relationship("ClientRoutine", back_populates="routine")
    sessions = relationship("Session", back_populates="routine")
    adjustments = relationship("Adjustment", back_populates="routine")


class RoutineExercise(Base):
    __tablename__ = "routine_exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order = Column(Integer, nullable=False)
    sets = Column(Integer, nullable=True)
    reps = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)  # En segundos
    rest_time = Column(Integer, nullable=True)  # En segundos

    routine_id = Column(UUID(as_uuid=True), ForeignKey("routines.id"), nullable=False)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False)

    routine = relationship("Routine", back_populates="exercises")
    exercise = relationship("Exercise", back_populates="routine_exercises")


class ClientRoutine(Base):
    __tablename__ = "client_routines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Integer, default=1)  # 1 = activo, 0 = inactivo

    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    routine_id = Column(UUID(as_uuid=True), ForeignKey("routines.id"), nullable=False)

    client = relationship("Client", back_populates="client_routines")
    routine = relationship("Routine", back_populates="client_routines")
