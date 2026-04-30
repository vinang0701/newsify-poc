from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.institution_admin import achievements_service
from app.core.db import supabase
from app.core.auth import verify_admin, get_current_user

router = APIRouter(
    prefix="/{inst_id}/admin/achievements",
    tags=["admin_achievements"],
    dependencies=[Depends(get_current_user)],
)


class CreateAchievement(BaseModel):
    achievement_name: str
    achievement_detail: str
    metric_key: str
    required_count: int
    badge_url: Optional[str] = None


class UpdateAchievement(BaseModel):
    achievement_name: Optional[str] = None
    achievement_detail: Optional[str] = None
    metric_key: Optional[str] = None
    required_count: Optional[int] = None
    badge_url: Optional[str] = None


@router.get("/")
async def get_achievements(inst_id: str):
    try:
        return await achievements_service.get_achievements(supabase, inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", status_code=201)
async def create_achievement(inst_id: str, data: CreateAchievement):
    try:
        return await achievements_service.create_achievement(supabase, {
            "achievement_name": data.achievement_name,
            "achievement_detail": data.achievement_detail,
            "metric_key": data.metric_key,
            "required_count": data.required_count,
            "badge_url": data.badge_url,
            "status": "active",
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{achievement_id}")
async def update_achievement(inst_id: str, achievement_id: str, data: UpdateAchievement):
    try:
        return await achievements_service.update_achievement(
            supabase, achievement_id, data.dict(exclude_none=True)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{achievement_id}/suspend")
async def suspend_achievement(inst_id: str, achievement_id: str):
    try:
        return await achievements_service.suspend_achievement(supabase, achievement_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{achievement_id}/activate")
async def activate_achievement(inst_id: str, achievement_id: str):
    try:
        return await achievements_service.activate_achievement(supabase, achievement_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
