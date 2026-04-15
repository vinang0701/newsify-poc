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
from app.core.auth import verify_admin, get_current_user
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


@router.post("/", status_code=201)
async def create_user_route(
    current_user: dict = Depends(get_current_user),
    new_user_name: str = Form(...),
    new_user_email: EmailStr = Form(...),
    password: str = Form(...),
    role: str = Form(...),
):
    try:
        inst_id = current_user.get("app_metadata", {}).get("inst_id")
        if not inst_id:
            raise HTTPException(
                status_code=403,
                detail="Unauthorized: Admin/Staff institution ID not found.",
            )

        # Check if name is at least 2 characters
        if len(new_user_name) < 2:
            raise HTTPException(
                status_code=400,
                detail="Name does not meet the standard requirement.",
            )

        # Check if password is at least 8 characters
        if len(password) < 8:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 8 characters long.",
            )

        result = await users_service.create_new_user(
            supabase, inst_id, new_user_name, new_user_email, password, role
        )

        if result is None:
            raise HTTPException(
                status_code=400,
                detail="User could not be created. Email might already exist.",
            )

        return {"message": "User created successfully", "data": result}
    except HTTPException as he:
        raise he

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
