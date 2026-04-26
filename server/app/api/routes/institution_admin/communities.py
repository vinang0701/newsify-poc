import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from app.services.institution_admin import communities_service
from app.core.config import settings
from app.core.db import supabase
from app.models.admin import Community, CommunityCreationReqBody
from app.core.auth import verify_admin
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/{inst_id}/admin/communities",
    tags=["admin_users"],
    dependencies=[Depends(verify_admin)],
)


@router.get("")
async def get_communities(inst_id: str):
    try:
        communities = await communities_service.get_communities(supabase, inst_id)
        if communities is None:
            raise HTTPException(status_code=404, detail="No community found.")
        return communities
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/requests")
async def get_community_creation_requests(inst_id: str):
    try:
        comm_requests = await communities_service.get_community_creation_requests(
            supabase, inst_id
        )
        if comm_requests is None:
            raise HTTPException(
                status_code=404, detail="No community creation request found."
            )
        return comm_requests
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Respond to community creation request
# will take in a body to check for {"status":"approved" or "rejected"}
@router.patch("/requests")
async def respond_to_community_creation_request(
    inst_id: str,
    payload: CommunityCreationReqBody,
    current_user=Depends(get_current_user),
):
    try:
        reviewed_by_user_id = current_user.id

        response = await communities_service.respond_to_community_creation_request(
            supabase,
            inst_id=inst_id,
            request_id=payload.request_id,
            reviewed_by_user_id=reviewed_by_user_id,
            response_status=payload.response_status,
            rejection_reason=payload.rejection_reason,
        )
        if response is None:
            raise HTTPException(
                status_code=400, detail="Something went wrong updating the request."
            )
        return response
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
