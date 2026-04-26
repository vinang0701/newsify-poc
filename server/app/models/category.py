import uuid
from typing import List, Dict, Any, Optional
from pydantic import EmailStr, BaseModel
from datetime import datetime


class Category(BaseModel):
    category_id: uuid.UUID
    category_name: str
    created_at: Optional[datetime] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True
