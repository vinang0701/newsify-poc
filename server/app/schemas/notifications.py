from typing import Any

from pydantic import BaseModel


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


class NotificationsResponse(BaseModel):
    notifications: list[NotificationItem]
    invitations: list[InvitationItem]
    unread_count: int


class InvitationActionRequest(BaseModel):
    action: str


class GenericMessageResponse(BaseModel):
    message: str