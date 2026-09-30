"""
Modelo de Cliente.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from .program import client_programs


class Client(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    age = Column(Integer, nullable=False)
    location = Column(String(200), nullable=False)  # Sede
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    programs = relationship("Program", secondary=client_programs, back_populates="clients")
    client_routines = relationship("ClientRoutine", back_populates="client")
    sessions = relationship("Session", back_populates="client")
    adjustments = relationship("Adjustment", back_populates="client")
