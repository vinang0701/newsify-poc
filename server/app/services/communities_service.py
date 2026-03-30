from supabase import Client
from typing import List
from app.models.community import Community, CommunityMembership, CommunityMember
from app.core.db import supabase
import uuid


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


async def get_community(supabase: Client, community_id: str) -> List[dict]:
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


async def leave_community(supabase: Client, community_id: str, user_id: str):
    print(user_id)
    print(community_id)
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
                "joined_at": "now()",
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
    memberships = [
        CommunityMember(
            community_id=community_id,
            user_id=member["users"]["id"],
            name=member["users"]["name"],
            role=member.get("role", "member"),  # Fallback to 'member' if NULL
        )
        for member in response.data
        if member.get("users")
    ]

    return memberships
