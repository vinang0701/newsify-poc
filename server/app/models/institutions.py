import uuid
from typing import Optional
from pydantic import BaseModel


class Institution(BaseModel):
    id: uuid.UUID
    name: str
    domain: str
    phone: Optional[str] = None
    plan: Optional[str] = None
    status: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class CreateInstitution(BaseModel):
    name: str
    domain: str
    phone: Optional[str] = None
    plan: str
    start_date: str
    end_date: str


class UpdateInstitution(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    phone: Optional[str] = None
    plan: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None