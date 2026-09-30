"""
Modelo de Entrenador.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from .program import trainer_programs


class Trainer(Base):
    __tablename__ = "trainers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    specialty = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    exercises = relationship("Exercise", back_populates="created_by")
    routines_created = relationship("Routine", foreign_keys="Routine.creator_id", back_populates="creator")
    routines_reviewed = relationship("Routine", foreign_keys="Routine.reviewer_id", back_populates="reviewer")
    programs = relationship("Program", secondary=trainer_programs, back_populates="trainers")
    adjustments = relationship("Adjustment", back_populates="trainer")
