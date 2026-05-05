import uuid
from typing import List, Dict, Any, Optional
from pydantic import EmailStr, BaseModel, Field


class User(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    role: str
    status: str
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


# Communities
class Community(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    created_by_user_id: uuid.UUID
    created_by_user_name: str
    created_by_user_image_url: str | None = None
    image_url: str | None = None
    status: str
    created_at: str
    updated_at: str | None = None
    member_count: int = 0


#
class CommunityCreationReqBody(BaseModel):
    request_id: str
    response_status: str  # "approved" or "rejected"
    rejection_reason: str | None = None


class CommunityCreationRequest(BaseModel):
    request_id: uuid.UUID
    requested_by_user_id: uuid.UUID
    requested_by_user_name: str
    requested_by_user_image_url: str | None = None
    community_name: str
    description: str
    status: str
    created_at: str
    reviewed_at: str | None = None
    reviewed_by_user_id: uuid.UUID | None = None
    reviewed_by_user_name: str | None = None
    rejection_reason: str | None = None
