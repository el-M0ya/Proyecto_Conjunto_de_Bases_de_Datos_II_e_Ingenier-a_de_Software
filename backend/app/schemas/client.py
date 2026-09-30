"""
Esquemas Pydantic para Clientes.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ClientCreate(BaseModel):
    name: str
    age: int
    location: str


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    location: Optional[str] = None


class ClientResponse(BaseModel):
    id: str
    name: str
    age: int
    location: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
