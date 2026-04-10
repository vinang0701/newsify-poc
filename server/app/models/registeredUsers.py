import uuid
from typing import List, Dict, Any
from pydantic import EmailStr, BaseModel


class RegisteredUser:
    instId: uuid.UUID
    id: uuid.UUID
    name: str
    email: EmailStr
    faculty: str


class UserProfileDetails(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None

    class Config:
        from_attributes = True

class UserFollowing(BaseModel):
    followed_user_id: uuid.UUID
    name: str

    class Config:
            from_attributes = True