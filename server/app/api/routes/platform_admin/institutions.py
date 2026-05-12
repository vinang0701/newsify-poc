from fastapi import APIRouter, Depends, HTTPException
from app.services.platform_admin import institutions_service
from app.core.db import supabase
from app.core.auth import verify_admin
from app.models.institutions import CreateInstitution, UpdateInstitution

router = APIRouter(
    prefix="/platform/institutions",
    tags=["platform_institutions"],
)

@router.get("/")
async def get_institutions():
    try:
        return await institutions_service.get_institutions(supabase)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_institution(data: CreateInstitution):
    try:
        return await institutions_service.create_institution(supabase, {
            "name": data.name,
            "domain": data.domain,
            "phone": data.phone,
            "plan": data.plan,
            "status": "Active",
            "start_date": data.start_date,
            "end_date": data.end_date,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{inst_id}")
async def update_institution(inst_id: str, data: UpdateInstitution):
    try:
        return await institutions_service.update_institution(supabase, inst_id, data.dict(exclude_none=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{inst_id}/suspend")
async def suspend_institution(inst_id: str):
    try:
        return await institutions_service.suspend_institution(supabase, inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{inst_id}/activate")
async def activate_institution(inst_id: str):
    try:
        return await institutions_service.activate_institution(supabase, inst_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/stats")
async def get_platform_stats():
    try:
        return await institutions_service.get_platform_stats(supabase)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))