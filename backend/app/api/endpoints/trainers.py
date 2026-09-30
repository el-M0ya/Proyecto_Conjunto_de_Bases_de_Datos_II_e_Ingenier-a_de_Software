"""
Endpoints CRUD para Entrenadores.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.trainer import Trainer
from app.schemas.trainer import TrainerCreate, TrainerUpdate, TrainerResponse

router = APIRouter()


@router.get("/api/trainers", response_model=List[TrainerResponse])
def get_trainers(db: Session = Depends(get_db)):
    """Obtiene todos los entrenadores."""
    return db.query(Trainer).order_by(Trainer.name).all()


@router.get("/api/trainers/{trainer_id}", response_model=TrainerResponse)
def get_trainer(trainer_id: str, db: Session = Depends(get_db)):
    """Obtiene un entrenador por su ID."""
    trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Entrenador no encontrado")
    return trainer


@router.post("/api/trainers", response_model=TrainerResponse, status_code=201)
def create_trainer(trainer: TrainerCreate, db: Session = Depends(get_db)):
    """Crea un nuevo entrenador."""
    db_trainer = Trainer(**trainer.model_dump())
    db.add(db_trainer)
    db.commit()
    db.refresh(db_trainer)
    return db_trainer


@router.put("/api/trainers/{trainer_id}", response_model=TrainerResponse)
def update_trainer(trainer_id: str, trainer: TrainerUpdate, db: Session = Depends(get_db)):
    """Actualiza un entrenador existente."""
    db_trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not db_trainer:
        raise HTTPException(status_code=404, detail="Entrenador no encontrado")
    for key, value in trainer.model_dump(exclude_unset=True).items():
        setattr(db_trainer, key, value)
    db.commit()
    db.refresh(db_trainer)
    return db_trainer


@router.delete("/api/trainers/{trainer_id}", status_code=204)
def delete_trainer(trainer_id: str, db: Session = Depends(get_db)):
    """Elimina un entrenador."""
    db_trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
    if not db_trainer:
        raise HTTPException(status_code=404, detail="Entrenador no encontrado")
    db.delete(db_trainer)
    db.commit()
