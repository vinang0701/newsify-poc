import uuid
from typing import Any, Optional, List, Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    Form,
    File,
    Query,
)
from pydantic import EmailStr, BaseModel
from app.services.institution_admin import users_service
from app.core.db import supabase
from app.core.config import settings
from app.core.auth import verify_admin, get_current_user, UserPayload
from app.services import categories_service

router = APIRouter(
    prefix="/{inst_id}/categories",
    tags=["categories"],
    dependencies=[Depends(get_current_user)],
)


@router.get("")
async def get_categories(inst_id: str):
    response = await categories_service.get_categories(supabase=supabase)

    return response
