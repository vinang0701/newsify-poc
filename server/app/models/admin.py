import uuid
from typing import List, Dict, Any, Optional
from pydantic import EmailStr, BaseModel, Field


class User(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class CreateUseFormData(BaseModel):
    inst_id: uuid.UUID
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    role: str = Field(..., pattern="^(student|staff|admin)$")


class CreateUser(BaseModel):
    inst_id: uuid.UUID
    name: str
    email: EmailStr
    password: str
    role: str
