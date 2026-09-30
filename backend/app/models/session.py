"""
Modelo de Sesión de Entrenamiento.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(String(1000), nullable=True)

    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    routine_id = Column(UUID(as_uuid=True), ForeignKey("routines.id"), nullable=False)

    client = relationship("Client", back_populates="sessions")
    routine = relationship("Routine", back_populates="sessions")
