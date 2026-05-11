import uuid
from typing import List, Dict, Any, Optional
from pydantic import EmailStr, BaseModel
from app.models.category import Category
from datetime import datetime


class RegisteredUser(BaseModel):
    inst_id: uuid.UUID
    id: uuid.UUID
    name: str
    email: EmailStr
    role: str
    status: str


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


class UserFollowers(BaseModel):
    follower_user_id: uuid.UUID
    name: str

    class Config:
        from_attributes = True


# User preferences
class UserPreference(BaseModel):
    user_id: uuid.UUID
    category: Category
    preference_type: str
    created_at: Optional[datetime] = None


class PreferenceItem(BaseModel):
    category_id: uuid.UUID
    preference_type: str


class SavePreferencesRequest(BaseModel):
    preferences: List[PreferenceItem]


class UserRequestItem(BaseModel):
    id: str
    request_type: str
    title: str
    subtitle: str | None = None
    community_name: str | None = None
    status: str
    rejection_reason: str | None = None
    created_at: str

    class Config:
        from_attributes = True
