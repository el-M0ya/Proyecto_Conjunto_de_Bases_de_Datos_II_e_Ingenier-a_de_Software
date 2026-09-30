"""
Endpoints CRUD para Clientes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse

router = APIRouter()


@router.get("/api/clients", response_model=List[ClientResponse])
def get_clients(db: Session = Depends(get_db)):
    """Obtiene todos los clientes."""
    return db.query(Client).order_by(Client.name).all()


@router.get("/api/clients/{client_id}", response_model=ClientResponse)
def get_client(client_id: str, db: Session = Depends(get_db)):
    """Obtiene un cliente por su ID."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return client


@router.post("/api/clients", response_model=ClientResponse, status_code=201)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """Crea un nuevo cliente."""
    db_client = Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.put("/api/clients/{client_id}", response_model=ClientResponse)
def update_client(client_id: str, client: ClientUpdate, db: Session = Depends(get_db)):
    """Actualiza un cliente existente."""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    for key, value in client.model_dump(exclude_unset=True).items():
        setattr(db_client, key, value)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.delete("/api/clients/{client_id}", status_code=204)
def delete_client(client_id: str, db: Session = Depends(get_db)):
    """Elimina un cliente."""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    db.delete(db_client)
    db.commit()
