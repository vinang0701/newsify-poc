import uuid
from typing import List, Dict, Any
from pydantic import EmailStr, BaseModel


class Community(BaseModel):
    id: uuid.UUID
    created_by_user_id: uuid.UUID
    name: str
    description: str
    status: str
    image_url: str

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
