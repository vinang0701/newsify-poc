import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException


from app.core.config import settings

router = APIRouter(prefix="/registered_users", tags=["registered_users"])


@router.get("/")
def test_route():
    print("Hello World!")
    return "Hello"
