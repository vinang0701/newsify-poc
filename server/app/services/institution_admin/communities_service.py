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
        .select("*, community_members(count)")
        .eq("inst_id", inst_id)
        .order("created_at", desc=True)
        .execute()
    )

    communities = []
    for comm in response.data:
        # Extract member count from nested result
        comm["member_count"] = comm.get("community_members", [{}])[0].get("count", 0)
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
        req["community_public"] = req["public"]
        req["community_image_url"] = req["image_url"]
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
                    "status": "active",
                    "public": request_data["public"],
                    "image_url": request_data["image_url"],
                }
            )
            .execute()
        )

        if not insert_result.data:
            raise HTTPException(
                status_code=500, detail="Failed to create community record"
            )

        new_community_id = insert_result.data[0]["id"]

        insert_member = (
            supabase.table("community_members")
            .insert(
                {
                    "user_id": request_data["requested_by_user_id"],
                    "community_id": new_community_id,
                    "role": "admin",
                    "status": "active",
                }
            )
            .execute()
        )

        supabase.table("notifications").insert(
            {
                "actor_user_id": reviewed_by_user_id,
                "notification_type": "COMMUNITY_APPROVED",
                "recipient_user_id": request_data["requested_by_user_id"],
                "reference_id": request_id,
                "reference_table": "community_creation_requests",
                "message": f"Your application for {request_data['community_name']} was approved!",
                "is_read": False,
            }
        ).execute()

    else:
        supabase.table("notifications").insert(
            {
                "actor_user_id": reviewed_by_user_id,
                "notification_type": "COMMUNITY_REJECTED",
                "recipient_user_id": request_data["requested_by_user_id"],
                "reference_id": request_id,
                "reference_table": "community_creation_requests",
                "message": f"Application rejected. Reason: {rejection_reason}",
                "is_read": False,
            }
        ).execute()

    # If rejected, return the updated request info
    return request_data


async def update_community_status(
    supabase: Client,
    community_id: str,
    status: str,
) -> dict:
    response = (
        supabase.table("communities")
        .update({"status": status})
        .eq("id", community_id)
        .execute()
    )
    return response.data


async def get_community_admins(supabase: Client, community_id: str) -> List[dict]:
    # Fetch all members with admin role in this community
    response = (
        supabase.table("community_members")
        .select("user_id, role, users(id, name, email)")
        .eq("community_id", community_id)
        .eq("role", "admin")
        .execute()
    )
    return response.data


async def promote_to_admin(
    supabase: Client,
    community_id: str,
    user_id: str,
) -> dict:
    # Step 1: Update role in community_members
    supabase.table("community_members").update({"role": "admin"}).eq(
        "community_id", community_id
    ).eq("user_id", user_id).execute()

    # Step 2: Insert into community_admins table
    response = (
        supabase.table("community_admins")
        .insert(
            {
                "community_id": community_id,
                "user_id": user_id,
            }
        )
        .execute()
    )

    # Step 3: Notify the promoted user
    supabase.table("notifications").insert(
        {
            "actor_user_id": user_id,
            "notification_type": "ROLE_CHANGE",
            "reference_id": community_id,
            "reference_table": "communities",
            "message": "You have been promoted to community admin.",
            "is_read": False,
            "recipient_user_id": user_id,
        }
    ).execute()

    return response.data


async def revoke_admin(
    supabase: Client,
    community_id: str,
    user_id: str,
) -> dict:
    # Step 1: Update role in community_members
    supabase.table("community_members").update({"role": "member"}).eq(
        "community_id", community_id
    ).eq("user_id", user_id).execute()

    # Step 2: Remove from community_admins table
    response = (
        supabase.table("community_admins")
        .delete()
        .eq("community_id", community_id)
        .eq("user_id", user_id)
        .execute()
    )

    # Step 3: Notify the user whose admin rights were revoked
    supabase.table("notifications").insert(
        {
            "actor_user_id": user_id,
            "notification_type": "ROLE_CHANGE",
            "reference_id": community_id,
            "reference_table": "communities",
            "message": "Your community admin rights have been revoked.",
            "is_read": False,
            "recipient_user_id": user_id,
        }
    ).execute()

    return response.data


async def notify_community_admins(
    supabase: Client,
    community_id: str,
    admin_id: str,
    message: str,
) -> None:
    # Get all community admins
    admins = await get_community_admins(supabase, community_id)

    # Send notification to each admin
    for admin in admins:
        supabase.table("notifications").insert(
            {
                "actor_user_id": admin_id,
                "notification_type": "COMMUNITY_STATUS_CHANGE",
                "reference_id": community_id,
                "reference_table": "communities",
                "message": message,
                "is_read": False,
                "recipient_user_id": admin["user_id"],
            }
        ).execute()


async def get_community_with_members(
    supabase: Client,
    community_id: str,
) -> dict:
    # Get community details
    comm_response = supabase.table("communities").select("""
            id,
            name,
            description,
            status,
            image_url,
            created_at
            """).eq("id", community_id).single().execute()

    if not comm_response.data:
        return None

    # Get all members
    members_response = (
        supabase.table("community_members")
        .select("user_id, role, joined_at, users(id, name, email)")
        .eq("community_id", community_id)
        .order("joined_at", desc=False)
        .execute()
    )

    return {
        "community": comm_response.data,
        "members": members_response.data,
    }


async def get_community(supabase: Client, community_id: str):
    response = (
        supabase.table("communities")
        .select("id, name, description, status, image_url")
        .eq("id", community_id)
        .single()
        .execute()
    )
    if not response.data:
        return None
    return response.data
