import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from app.services.institution_admin import communities_service
from app.core.config import settings
from app.core.db import supabase
from app.models.admin import Community, CommunityCreationReqBody
from app.core.auth import verify_admin
from app.core.auth import get_current_user, get_current_app_user

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
    current_user=Depends(get_current_app_user),
):
    try:
        reviewed_by_user_id = current_user["id"]

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


# Get community details with members
@router.get("/{community_id}/details")
async def get_community_details(community_id: str):
    try:
        result = await communities_service.get_community_with_members(
            supabase, community_id
        )
        if not result:
            raise HTTPException(status_code=404, detail="Community not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Put community under review
@router.patch("/{community_id}/review")
async def put_under_review(
    community_id: str,
    inst_id: str,
    current_user=Depends(get_current_app_user),
):
    try:
        # Get community name for notification message
        comm = await communities_service.get_community(supabase, community_id)
        if not comm:
            raise HTTPException(status_code=404, detail="Community not found")

        # Update status
        await communities_service.update_community_status(
            supabase, community_id, "under_review"
        )

        # Notify all community admins
        await communities_service.notify_community_admins(
            supabase,
            community_id,
            current_user["id"],
            f"Your community '{comm["name"]}' has been put under review by the institution admin. Posting and communication are temporarily suspended.",
        )

        return {"message": "Community put under review successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"EXACT ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Reactivate community
@router.patch("/{community_id}/reactivate")
async def reactivate_community(
    community_id: str,
    inst_id: str,
    current_user=Depends(get_current_app_user),
):
    try:
        comm = await communities_service.get_community(supabase, community_id)
        if not comm:
            raise HTTPException(status_code=404, detail="Community not found")

        await communities_service.update_community_status(
            supabase, community_id, "active"
        )

        await communities_service.notify_community_admins(
            supabase,
            community_id,
            current_user["id"],
            f"Your community '{comm["name"]}' has been reactivated. Normal operations have resumed.",
        )

        return {"message": "Community reactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Disband community
@router.patch("/{community_id}/disband")
async def disband_community(
    community_id: str,
    inst_id: str,
    current_user=Depends(get_current_app_user),
):
    try:
        comm = await communities_service.get_community(supabase, community_id)
        if not comm:
            raise HTTPException(status_code=404, detail="Community not found")

        await communities_service.update_community_status(
            supabase, community_id, "disbanded"
        )

        await communities_service.notify_community_admins(
            supabase,
            community_id,
            current_user["id"],
            f"Your community '{comm["name"]}' has been disbanded by the institution admin.",
        )

        return {"message": "Community disbanded successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Promote member to admin
@router.patch("/{community_id}/members/{user_id}/promote")
async def promote_to_admin(community_id: str, user_id: str):
    try:
        result = await communities_service.promote_to_admin(
            supabase, community_id, user_id
        )
        if not result:
            raise HTTPException(status_code=404, detail="Member not found")
        return {"message": "Member promoted to admin successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Revoke admin rights
@router.patch("/{community_id}/members/{user_id}/revoke")
async def revoke_admin(community_id: str, user_id: str):
    try:
        result = await communities_service.revoke_admin(supabase, community_id, user_id)
        if not result:
            raise HTTPException(status_code=404, detail="Member not found")
        return {"message": "Admin rights revoked successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
