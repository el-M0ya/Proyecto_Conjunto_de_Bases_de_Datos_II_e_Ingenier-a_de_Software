"""
Modelo de Ajuste de Rutina.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class AdjustmentStatus(str, enum.Enum):
    SOLICITADO = "SOLICITADO"
    EN_PROCESO = "EN_PROCESO"
    COMPLETADO = "COMPLETADO"
    RECHAZADO = "RECHAZADO"


class Adjustment(Base):
    __tablename__ = "adjustments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(Enum(AdjustmentStatus), default=AdjustmentStatus.SOLICITADO)
    request_reason = Column(String(1000), nullable=False)
    result = Column(String(1000), nullable=True)
    requested_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    routine_id = Column(UUID(as_uuid=True), ForeignKey("routines.id"), nullable=False)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey("trainers.id"), nullable=True)

    client = relationship("Client", back_populates="adjustments")
    routine = relationship("Routine", back_populates="adjustments")
    trainer = relationship("Trainer", back_populates="adjustments")
