from pydantic import BaseModel
from typing import Any


class NotificationItem(BaseModel):
    id: str
    type: str
    title: str
    body: str | None = None
    created_at: str
    is_read: bool
    actor_name: str | None = None
    actor_avatar_url: str | None = None
    metadata: dict[str, Any] | None = None


class InvitationItem(BaseModel):
    id: str
    community_id: str
    community_name: str
    inviter_name: str | None = None
    inviter_avatar_url: str | None = None
    status: str
    created_at: str
    rejection_reason: str | None = None


class NotificationsListResponse(BaseModel):
    items: list[NotificationItem]


class InvitationsListResponse(BaseModel):
    items: list[InvitationItem]


class UnreadCountResponse(BaseModel):
    unread_count: int


class GenericMessageResponse(BaseModel):
    message: str


class InvitationActionRequest(BaseModel):
    action: str