import uuid
from typing import List, Dict, Any, Optional
from pydantic import EmailStr, BaseModel
from datetime import datetime


class Community(BaseModel):
    id: uuid.UUID
    inst_id: uuid.UUID
    created_by_user_id: uuid.UUID
    name: str
    description: str
    status: str
    image_url: str | None = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class CommunityMembers(BaseModel):
    community_id: uuid.UUID
    community_name: str
    role: str


class CommunityApplicationReq(BaseModel):
    name: str
    description: str
    requested_by_user_id: uuid.UUID


class CommunityApplication(BaseModel):
    requested_by_user_id: uuid.UUID
    inst_id: uuid.UUID
    name: str
    description: str


class CommunityMembership(BaseModel):
    community_id: uuid.UUID
    user_id: uuid.UUID
    role: str


class CommunityMember(BaseModel):
    community_id: uuid.UUID
    user_id: uuid.UUID
    name: str
    role: str


class CommunityPostRequest(BaseModel):
    request_id: str
    author_name: str
    image_url: str
    title: str
    description: str
    status: str
    created_at: str
    reviewed_at: Optional[str] = None
    reviewed_by: Optional[str] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True
        use_enum_values = True
