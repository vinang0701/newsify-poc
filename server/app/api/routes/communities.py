""" """

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from app.services import communities_service, news_service
from app.core.config import settings
from app.core.db import supabase
from app.models.community import CommunityApplication, CommunityApplicationReq
from app.core.auth import get_current_user, get_current_app_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/{inst_id}/communities", tags=["communities"])


class UpdatePostRequestStatus(BaseModel):
    status: str
    rejection_reason: Optional[str] = None


# Return an array of institution news
@router.get("/")
async def get_communities(inst_id: str):
    # Add JWT Decode later

    # Use user_email in request body first

    # call DB
    posts = await communities_service.get_communities(supabase, inst_id)
    if posts is None:
        raise HTTPException(
            status_code=404, detail="No communities found for this institution"
        )

    return posts


@router.get("/{community_id}")
async def get_community(community_id: str):
    community = await communities_service.get_community(supabase, community_id)

    return community


@router.get("/{community_id}/news")
async def get_community_news(community_id: str):
    community_news = await news_service.get_community_news(supabase, community_id)
    if community_news is None:
        raise HTTPException(status_code=404, detail="This community does not exist.")

    return community_news or []


@router.post("/requests")
async def create_community_application(
    inst_id: uuid.UUID, reqData: CommunityApplicationReq
):
    # Add JWT decode to get user id instead of feeding in to body
    # for now grab from body

    formData = CommunityApplication(
        requested_by_user_id=reqData.requested_by_user_id,
        inst_id=inst_id,
        name=reqData.name,
        description=reqData.description,
    )

    data, error = await communities_service.create_community_application(
        supabase, formData
    )

    if error:
        raise HTTPException(
            status_code=400, detail=f"Failed to create community: {error.message}"
        )

    return {
        "status": "ok",
        "message": "Successfully submitted application!",
        "data": data,
    }


@router.get("/{community_id}/members")
async def get_community_members(inst_id: str, community_id: str):
    try:
        # Call the service to fetch joined data
        members = await communities_service.get_members_by_community(
            supabase, community_id
        )
        return members
    except Exception as e:
        print(f"Error fetching members: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch community members")


@router.get("/{community_id}/members/me/role")
async def get_community_role(
    inst_id: str, community_id: str, current_user=Depends(get_current_app_user)
):
    try:
        role = await communities_service.get_community_role(
            supabase, community_id, current_user["id"]
        )
        return {"role": role}
    except Exception as e:
        print(f"Error fetching role: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch community role")


@router.get("/{community_id}/post_requests")
async def get_community_post_requests(inst_id: str, community_id: str):
    try:
        post_request = await communities_service.get_community_post_requests(
            supabase, community_id
        )
        return post_request
    except Exception as e:
        print(f"Error fetching members: {e}")
        raise HTTPException(
            status_code=500, detail="Could not fetch community post requests"
        )


@router.post("/{community_id}/post_requests/{request_id}")
async def update_community_post_request(
    inst_id: str,
    community_id: str,
    request_id: str,
    review_data: UpdatePostRequestStatus,
    current_user=Depends(get_current_app_user),
):
    try:
        updated_request, error = (
            await communities_service.update_community_post_request(
                supabase,
                request_id=request_id,
                status=review_data.status,
                reviewed_by_user_id=current_user["id"],
                rejection_reason=review_data.rejection_reason,
            )
        )

        if error:
            raise HTTPException(
                status_code=400, detail=f"Failed to update post request: {error}"
            )

        return {
            "status": "ok",
            "message": f"Post request {review_data.status}",
            "data": updated_request,
        }
    except Exception as e:
        print(f"Error reviewing post request: {e}")
        raise HTTPException(status_code=500, detail="Failed to review post request")
