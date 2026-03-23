import uuid
from typing import List, Dict, Any
from pydantic import EmailStr, BaseModel


class NewsPost(BaseModel):
    id: uuid.UUID
    author: uuid.UUID
    title: str
    description: str
    image_url: str
    content: Dict[str, Any]  # find a way to take in json to match DB / make new class

    class Config:
        from_attributes = True
