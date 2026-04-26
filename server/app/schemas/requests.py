from pydantic import BaseModel


class UserRequestItem(BaseModel):
    id: str
    request_type: str
    title: str
    subtitle: str | None = None
    community_name: str | None = None
    status: str
    rejection_reason: str | None = None
    created_at: str


class UserRequestsResponse(BaseModel):
    requests: list[UserRequestItem]