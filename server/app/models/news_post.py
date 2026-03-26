import uuid
from typing import List, Dict, Any
from pydantic import EmailStr, BaseModel


class NewsPost(BaseModel):
    id: uuid.UUID
    author_id: str
    author: str
    title: str
    description: str
    image_url: str
    content: Dict[str, Any]  # find a way to take in json to match DB / make new class

    class Config:
        from_attributes = True


class Draft(BaseModel):
    draft_id: uuid.UUID
    title: str | None = None
    image_url: str | None = None
    content: str | None = None
