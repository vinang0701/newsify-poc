import uuid
from typing import Any, Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, File, Query
from pydantic import EmailStr, BaseModel
from app.services.institution_admin import users_service
from app.core.db import supabase
from app.core.config import settings
from app.core.auth import verify_admin
from app.models.admin import CreateUser

router = APIRouter(
    prefix="/{inst_id}/admin/users",
    tags=["admin_users"],
    dependencies=[Depends(verify_admin)],
)


@router.get("/students")
async def get_student_users(inst_id: str):
    try:
        student_users = await users_service.get_student_users(supabase, inst_id)
        print("i dont think so")
        if student_users is None or len(student_users) == 0:
            print("here?")
            raise HTTPException(status_code=404, detail="No users found")
        print("should be here")
        return student_users
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
