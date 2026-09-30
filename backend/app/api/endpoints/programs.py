"""
Endpoints CRUD para Programas de Entrenamiento.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.program import Program
from app.schemas.program import ProgramCreate, ProgramUpdate, ProgramResponse

router = APIRouter()


@router.get("/api/programs", response_model=List[ProgramResponse])
def get_programs(db: Session = Depends(get_db)):
    """Obtiene todos los programas de entrenamiento."""
    return db.query(Program).order_by(Program.name).all()


@router.get("/api/programs/{program_id}", response_model=ProgramResponse)
def get_program(program_id: str, db: Session = Depends(get_db)):
    """Obtiene un programa por su ID."""
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Programa no encontrado")
    return program


@router.post("/api/programs", response_model=ProgramResponse, status_code=201)
def create_program(program: ProgramCreate, db: Session = Depends(get_db)):
    """Crea un nuevo programa de entrenamiento."""
    db_program = Program(**program.model_dump())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program


@router.put("/api/programs/{program_id}", response_model=ProgramResponse)
def update_program(program_id: str, program: ProgramUpdate, db: Session = Depends(get_db)):
    """Actualiza un programa existente."""
    db_program = db.query(Program).filter(Program.id == program_id).first()
    if not db_program:
        raise HTTPException(status_code=404, detail="Programa no encontrado")
    for key, value in program.model_dump(exclude_unset=True).items():
        setattr(db_program, key, value)
    db.commit()
    db.refresh(db_program)
    return db_program


@router.delete("/api/programs/{program_id}", status_code=204)
def delete_program(program_id: str, db: Session = Depends(get_db)):
    """Elimina un programa."""
    db_program = db.query(Program).filter(Program.id == program_id).first()
    if not db_program:
        raise HTTPException(status_code=404, detail="Programa no encontrado")
    db.delete(db_program)
    db.commit()
