"""
Modelo de Programa de Entrenamiento.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Table, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY, Enum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class MuscleGroup(str, enum.Enum):
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


# Tabla de relación muchos-a-muchos: entrenadores autorizados por programa
trainer_programs = Table(
    "trainer_programs",
    Base.metadata,
    Column("trainer_id", UUID(as_uuid=True), ForeignKey("trainers.id"), primary_key=True),
    Column("program_id", UUID(as_uuid=True), ForeignKey("programs.id"), primary_key=True),
)

# Tabla de relación muchos-a-muchos: clientes inscritos en programas
client_programs = Table(
    "client_programs",
    Base.metadata,
    Column("client_id", UUID(as_uuid=True), ForeignKey("clients.id"), primary_key=True),
    Column("program_id", UUID(as_uuid=True), ForeignKey("programs.id"), primary_key=True),
)


class Program(Base):
    __tablename__ = "programs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), unique=True, nullable=False)
    objective = Column(String(500), nullable=False)
    muscle_groups = Column(ARRAY(Enum(MuscleGroup)), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    routines = relationship("Routine", back_populates="program")
    trainers = relationship("Trainer", secondary=trainer_programs, back_populates="programs")
    clients = relationship("Client", secondary=client_programs, back_populates="programs")
