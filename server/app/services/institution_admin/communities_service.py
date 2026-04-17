from datetime import datetime, timezone

from fastapi import HTTPException

from supabase import Client
from typing import List
from pydantic import EmailStr
import uuid
from app.models.admin import Community, CommunityCreationRequest
from app.core.db import supabase


async def get_communities(supabase: Client, inst_id: str) -> List[dict]:
    response = (
        supabase.table("communities")
        .select("*, created_by:created_by_user_id(name, image_url)")
        .eq("inst_id", inst_id)
        .order("created_at", desc=True)
        .execute()
    )

    communities = []
    for comm in response.data:
        created_by = comm.get("created_by") or {}
        comm["created_by_user_name"] = created_by.get("name", "Unknown User")
        comm["created_by_user_image_url"] = created_by.get("image_url", "")
        communities.append(Community(**comm))

    return communities


async def get_community_creation_requests(supbase: Client, inst_id: str) -> List[dict]:
    response = (
        supabase.table("community_creation_requests")
        .select(
            "*, requested_by:requested_by_user_id(name, image_url),reviewed_by:reviewed_by_user_id(name)"
        )
        .eq("status", "pending")
        .execute()
    )

    requests = []
    for req in response.data:
        requested_by = req["requested_by"] or {}
        reviewed_by = req["reviewed_by"] or {}
        req["requested_by_user_name"] = requested_by["name"]
        req["requested_by_user_image_url"] = requested_by["image_url"]

        req["reviewed_by_user_name"] = reviewed_by.get("name", "")
        requests.append(CommunityCreationRequest(**req))

    return requests


async def respond_to_community_creation_request(
    supabase: Client,
    inst_id: str,
    request_id: str,
    reviewed_by_user_id: str,
    response_status: str,
    rejection_reason: str | None = None,
):
    now = datetime.now(timezone.utc).isoformat()
    update_result = (
        supabase.table("community_creation_requests")
        .update(
            {
                "status": response_status,
                "rejection_reason": (
                    rejection_reason if response_status == "rejected" else None
                ),
                "reviewed_by_user_id": reviewed_by_user_id,
                "reviewed_at": now,  # Fixed typo from 'review_at' if needed
            }
        )
        .eq("request_id", request_id)
        .execute()
    )

    if update_result.data is None:
        raise HTTPException(
            status_code=404, detail="Request not found or update failed"
        )

    request_data = update_result.data[0]

    # Insert new community into the community table
    if response_status == "approved":
        insert_result = (
            supabase.table("communities")
            .insert(
                {
                    "inst_id": inst_id,
                    "name": request_data["community_name"],
                    "description": request_data["description"],
                    "created_by_user_id": request_data["requested_by_user_id"],
                    "status": "active",
                }
            )
            .execute()
        )

        if not insert_result.data:
            raise HTTPException(
                status_code=500, detail="Failed to create community record"
            )

        return insert_result.data[0]

    # If rejected, return the updated request info
    return request_data
