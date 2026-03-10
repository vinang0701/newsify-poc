import uuid
from pydantic import EmailStr


class RegisteredUser:
    instId: uuid.UUID
    id: uuid.UUID
    name: str
    email: EmailStr
    faculty: str
