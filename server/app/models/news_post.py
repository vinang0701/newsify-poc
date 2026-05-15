import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import EmailStr, BaseModel


class NewsPost(BaseModel):
    id: uuid.UUID
    created_at: datetime
    author_id: str
    author: str
    author_avatar_url: Optional[str] = None
    title: str
    description: str = ""
    image_url: str = ""
    # content: Dict[str, Any]
    content: str | Dict[str, Any]
    likes_count: int = 0
    comments_count: int = 0
    has_liked: bool = False
    has_saved: bool = False
    community_id: str | None = None
    community_name: str | None = None
    community_image: str | None = None
    category_id: str | None = None

    class Config:
        from_attributes = True


class Draft(BaseModel):
    draft_id: uuid.UUID
    title: str | None = None
    thumbnail: str | None = None
    content: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


class PostCommentCreate(BaseModel):
    comment_text: str
    parent_comment_id: Optional[uuid.UUID] = None


class PostComment(BaseModel):
    comment_id: uuid.UUID
    post_id: uuid.UUID
    commented_by_user_id: uuid.UUID
    commented_by_user_name: Optional[str] = None
    comment_text: str
    parent_comment_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class LikeToggleResponseData(BaseModel):
    new_likes_count: int
    is_liked: bool


class LikeToggleResponse(BaseModel):
    status: str = "success"
    data: LikeToggleResponseData
