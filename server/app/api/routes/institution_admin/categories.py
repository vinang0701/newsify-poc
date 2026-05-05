from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.institution_admin import categories_service
from app.core.db import supabase
from app.core.auth import verify_admin, get_current_user

router = APIRouter(
    prefix="/{inst_id}/admin/categories",
    tags=["admin_categories"],
    dependencies=[Depends(verify_admin)],
)

class UpdateCategory(BaseModel):
    category_name: Optional[str] = None


@router.get("/")
async def get_categories(inst_id: str):
    try:
        return await categories_service.get_categories(supabase, inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{category_id}")
async def update_category(inst_id: str, category_id: str, data: UpdateCategory):
    try:
        return await categories_service.update_category(
            supabase, category_id, data.dict(exclude_none=True)
        )
    except Exception as e:
        print(f"Update error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{category_id}/suspend")
async def suspend_category(inst_id: str, category_id: str):
    try:
        return await categories_service.suspend_category(supabase, category_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{category_id}/activate")
async def activate_category(inst_id: str, category_id: str):
    try:
        return await categories_service.activate_category(supabase, category_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
