"""
Endpoints CRUD para Ejercicios.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.exercise import Exercise, ExerciseType, IntensityLevel
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate, ExerciseResponse

router = APIRouter()


@router.get("/api/exercises", response_model=List[ExerciseResponse])
def get_exercises(
    muscle_group: Optional[str] = Query(None, description="Filtrar por grupo muscular"),
    type: Optional[str] = Query(None, description="Filtrar por tipo de ejercicio"),
    intensity: Optional[str] = Query(None, description="Filtrar por nivel de intensidad"),
    db: Session = Depends(get_db)
):
    """Obtiene el listado de ejercicios con filtros opcionales."""
    query = db.query(Exercise)
    if muscle_group:
        query = query.filter(Exercise.muscle_group == muscle_group)
    if type:
        query = query.filter(Exercise.type == type)
    if intensity:
        query = query.filter(Exercise.intensity == intensity)
    return query.order_by(Exercise.name).all()


@router.get("/api/exercises/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: str, db: Session = Depends(get_db)):
    """Obtiene un ejercicio por su ID."""
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    return exercise


@router.post("/api/exercises", response_model=ExerciseResponse, status_code=201)
def create_exercise(exercise: ExerciseCreate, db: Session = Depends(get_db)):
    """Crea un nuevo ejercicio."""
    db_exercise = Exercise(**exercise.model_dump())
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise


@router.put("/api/exercises/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(exercise_id: str, exercise: ExerciseUpdate, db: Session = Depends(get_db)):
    """Actualiza un ejercicio existente."""
    db_exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not db_exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    for key, value in exercise.model_dump(exclude_unset=True).items():
        setattr(db_exercise, key, value)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise


@router.delete("/api/exercises/{exercise_id}", status_code=204)
def delete_exercise(exercise_id: str, db: Session = Depends(get_db)):
    """Elimina un ejercicio."""
    db_exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not db_exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    db.delete(db_exercise)
    db.commit()
