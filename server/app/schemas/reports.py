from pydantic import BaseModel


class CreatePostReportRequest(BaseModel):
    reason: str
    description: str | None = None


class CreatePostReportResponse(BaseModel):
    status: str
    message: str