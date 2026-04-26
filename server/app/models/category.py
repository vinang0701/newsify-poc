import uuid
from typing import List, Dict, Any
from pydantic import EmailStr, BaseModel
from datetime import datetime


class Category(BaseModel):
    category_id: uuid.UUID
    category_name: str
    created_at: datetime
    status: str

    class Config:
        from_attributes = True
