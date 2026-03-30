""" """

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from app.services import communities_service, news_service
from app.core.config import settings
from app.core.db import supabase
from app.models.community import CommunityApplication, CommunityApplicationReq


router = APIRouter(prefix="/{inst_id}/communities", tags=["communities"])


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
    if community is None:
        raise HTTPException(status_code=404, detail="Community cannot be found")

    return community


@router.get("/{community_id}/news")
async def get_community_news(community_id: str):
    community_news = await news_service.get_community_news(supabase, community_id)
    if community_news is None or len(community_news) == 0:
        raise HTTPException(status_code=404, detail="No news found")

    return community_news


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
