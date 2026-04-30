from supabase import Client
from typing import List
from app.models.community import (
    Community,
    CommunityMembership,
    CommunityMember,
    CommunityApplication,
    CommunityPostRequest,
)
from app.core.db import supabase
import uuid
from datetime import datetime


async def get_communities(supabase: Client, inst_id: str) -> List[dict]:
    response = (
        supabase.table("communities")
        .select(
            """
            id,
            created_by_user_id,
            name,
            description,
            status,
            image_url
        """
        )
        .eq("inst_id", inst_id)
        .order("name", desc=False)
        .execute()
    )

    # Need to add logic to check if user joined

    return [
        Community(
            id=comm["id"],
            created_by_user_id=comm["created_by_user_id"],
            name=comm["name"],
            description=comm["description"] or "",
            status=comm["status"],
            image_url=comm["image_url"] or "",
        )
        for comm in response.data
    ]


async def get_community(supabase: Client, community_id: str):
    response = (
        supabase.table("communities")
        .select(
            """
            id,
            created_by_user_id,
            name,
            description,
            status,
            image_url
        """
        )
        .eq("id", community_id)
        .execute()
    )

    if not response.data:
        return None

    comm = response.data[0]

    return Community(
        id=comm["id"],
        created_by_user_id=comm["created_by_user_id"],
        name=comm["name"],
        description=comm["description"] or "",
        status=comm["status"],
        image_url=comm["image_url"] or "",
    )


# Function to insert new community application into communities_requests
# Need to insert new record into community_memberships too


# For now, insert in both communities_requests table and communities table
async def create_community_application(
    supabase: Client, formData: CommunityApplication
):
    req_res = (
        supabase.table("community_requests")
        .insert(
            {
                "requested_by_user_id": str(formData.requested_by_user_id),
                "community_name": formData.name,
                "description": formData.description,
                "institution_id": str(formData.inst_id),
                "status": "pending",
            }
        )
        .execute()
    )

    # add error handling
    if req_res.data is None:
        return None, req_res.error

    response = (
        supabase.table("communities")
        .insert(
            {
                "created_by_user_id": str(formData.requested_by_user_id),
                "name": formData.name,
                "description": formData.description,
                "status": "active",
                "inst_id": str(formData.inst_id),
            }
        )
        .execute()
    )

    if response.data is None:
        return None, response.error

    # Insert into members
    mem_res = (
        supabase.table("community_members")
        .insert(
            {
                "community_id": response.data[0]["id"],
                "user_id": response.data[0]["created_by_user_id"],
                "role": "admin",
            }
        )
        .execute()
    )

    return response.data, None


async def get_community_membership(supabase, user_id: str):
    res = (
        supabase.table("community_members").select("*").eq("user_id", user_id).execute()
    )

    return [
        CommunityMembership(
            community_id=comm["community_id"],
            user_id=comm["user_id"],
            role=comm["role"],
        )
        for comm in res.data
    ]


async def get_community_role(supabase, community_id: str, user_id: str):
    res = (
        supabase.table("community_members")
        .select("role")
        .eq("user_id", user_id)
        .eq("community_id", community_id)
        .execute()
    )

    if res.data:
        return res.data[0]["role"]

    return None


async def leave_community(supabase: Client, community_id: str, user_id: str):
    response = (
        supabase.table("community_members")
        .delete()
        .eq("user_id", uuid.UUID(user_id))
        .eq("community_id", uuid.UUID(community_id))
        .execute()
    )
    return response.data


async def join_community(supabase: Client, community_id: str, user_id: str):
    response = (
        supabase.table("community_members")
        .insert(
            {
                "community_id": community_id,
                "user_id": user_id,
                "joined_at": datetime.utcnow().isoformat(),
                "role": "member",
            }
        )
        .execute()
    )

    return response


async def get_members_by_community(supabase: Client, community_id: str):
    # This syntax tells Supabase:
    # 1. Look at community_members
    # 2. Grab the related 'users' record for each row
    # 3. Only give me specific user fields
    response = (
        supabase.table("community_members")
        .select("role, users(id, name)")
        .eq("community_id", community_id)
        .execute()
    )

    # Supabase returns nested objects, so we flatten them for easier UI use
    members = [
        CommunityMember(
            community_id=community_id,
            user_id=member["users"]["id"],
            name=member["users"]["name"],
            role=member.get("role", "member"),  # Fallback to 'member' if NULL
        )
        for member in response.data
        if member.get("users")
    ]

    return members


async def get_community_post_requests(
    supabase, community_id: str
) -> list[CommunityPostRequest]:
    response = (
        supabase.table("community_post_requests")
        .select(
            """
            request_id,
            status,
            reviewed_at,
            rejection_reason,
            news_posts(id, title, created_at, description, image_url),
            author_name:requested_by_user_id(name),
            reviewed_by:reviewed_by_user_id(name)
            """
        )
        .eq("community_id", community_id)
        .order("news_posts(created_at)", desc=True)
        .execute()
    )

    result = []

    for row in response.data or []:
        author_name = row.get("author_name", {}).get("name", "")
        reviewed_by = (
            row.get("reviewed_by", {}).get("name", "")
            if row.get("reviewed_by")
            else "NULL"
        )
        image_url = row.get("news_posts", {}).get("image_url", "")
        title = row.get("news_posts", {}).get("title", "Untitled")
        description = row.get("news_posts", {}).get("description", "")
        created_at = datetime.fromisoformat(
            row.get("news_posts", {}).get("created_at", "")
        )
        formatted_created_at = created_at.strftime("%d/%m/%Y")
        reviewed_at = (
            datetime.fromisoformat(row["reviewed_at"])
            if row.get("reviewed_at")
            else None
        )
        formatted_reviewed_at = (
            reviewed_at.strftime("%d/%m/%Y") if reviewed_at else None
        )

        result.append(
            CommunityPostRequest(
                request_id=row["request_id"],
                author_name=author_name,
                image_url=image_url,
                title=title,
                description=description,
                status=row["status"],
                created_at=formatted_created_at,
                reviewed_at=formatted_reviewed_at,
                reviewed_by=reviewed_by,
                rejection_reason=row.get("rejection_reason"),
            )
        )

    return result


async def update_community_post_request(
    supabase: Client,
    request_id: str,
    status: str,
    reviewed_by_user_id: str,
    rejection_reason: str,
):
    reviewed_at = datetime.utcnow().isoformat() # current time

    update_data = {
        "status": status,
        "reviewed_at": reviewed_at,
        "reviewed_by_user_id": reviewed_by_user_id,
    }

    # rejection_reason if status is rejected
    if status == "rejected":
        update_data["rejection_reason"] = rejection_reason
    else:
        update_data["rejection_reason"] = ""

    response = (
        supabase.table("community_post_requests")
        .update(update_data)
        .eq("request_id", request_id)
        .execute()
    )

    return response.data, None


async def post_to_community(
    supabase: Client,
    community_id: str,
    request_id: str,
):
    select_response = (
        supabase.table("community_post_requests")
        .select("community_id, request_id, reviewed_at")
        .eq("request_id", request_id)
        .single()
        .execute()
    )

    if not select_response.data:
        raise Exception("Request not found")

    request_data = select_response.data

    community_id = request_data["community_id"]
    post_id = request_data["request_id"]
    reviewed_at = request_data["reviewed_at"]

    response = (
        supabase.table("community_posts")
        .insert(
            {
                "community_id": community_id,
                "post_id": post_id,
                "created_at": reviewed_at,
            }
        )
        .execute()
    )

    return response.data
