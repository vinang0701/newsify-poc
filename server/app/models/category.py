import uuid
from typing import List, Dict, Any
from pydantic import EmailStr, BaseModel


class Category(BaseModel):
    id: uuid.UUID
    name: str

    class Config:
        from_attributes = True
