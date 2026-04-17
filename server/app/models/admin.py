import uuid
from typing import List, Dict, Any, Optional
from pydantic import EmailStr, BaseModel


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


class CreateUser(BaseModel):
    inst_id: uuid.UUID
    name: str
    email: email
    role: str
