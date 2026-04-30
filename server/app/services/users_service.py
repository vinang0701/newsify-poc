from supabase import Client
from typing import List
from app.models.community import Community, CommunityMembers
from app.models.registeredUsers import (
    UserProfileDetails,
    UserFollowing,
    UserFollowers,
)
from app.core.db import supabase


# join table between communities and community_members
async def get_user_communities(supabase: Client, user_id: str) -> List[dict]:
    response = (
        supabase.table("communities")
        .select("*, community_members!inner(*)")
        .eq("community_members.user_id", user_id)
        .execute()
    )
    communities = []
    return [
        CommunityMembers(
            community_id=comm_mem["id"],
            community_name=comm_mem["name"],
            role=(
                comm_mem["community_members"][0]["role"]
                if comm_mem.get("community_members")
                else "unknown"
            ),
        )
        for comm_mem in response.data
    ]


async def get_user_profile(supabase: Client, inst_id: str, user_id: str) -> List[dict]:
    response = (
        supabase.table("users")
        .select("id, name, description")
        .eq("id", user_id)
        .execute()
    )
    return [
        UserProfileDetails(
            id=user["id"], name=user["name"], description=user["description"]
        )
        for user in response.data
    ]


async def get_user_followers(
    supabase: Client, inst_id: str, user_id: str
) -> List[dict]:
    response = (
        supabase.from_("user_follows")
        .select("follower_user_id, users!user_follows_follower_user_id_fkey(name)")
        .eq("followed_user_id", user_id)
        .execute()
    )
    return [
        UserFollowers(
            follower_user_id=user["follower_user_id"], name=user["users"]["name"]
        )
        for user in response.data
    ]


async def get_user_following(
    supabase: Client, inst_id: str, user_id: str
) -> List[dict]:
    response = (
        supabase.from_("user_follows")
        .select("followed_user_id, users!user_follows_followed_user_id_fkey(name)")
        .eq("follower_user_id", user_id)
        .execute()
    )
    return [
        UserFollowing(
            followed_user_id=user["followed_user_id"], name=user["users"]["name"]
        )
        for user in response.data
    ]


async def follow_user(supabase: Client, user_id: str, followed_user_id: str):
    response = (
        supabase.table("user_follows")
        .insert({"follower_user_id": user_id, "followed_user_id": followed_user_id})
        .execute()
    )

    return response


async def unfollow_user(supabase: Client, user_id: str, followed_user_id: str):
    response = (
        supabase.table("user_follows")
        .delete()
        .eq("follower_user_id", user_id)
        .eq("followed_user_id", followed_user_id)
        .execute()
    )
    return response.data


async def find_users_by_name(supabase: Client, inst_id: str, name: str | None):
    query = supabase.table("users").select("id, name, description, image_url")

    # Filter by institution first (important for multi-tenancy)
    query = query.eq("inst_id", inst_id)

    if name:
        # .ilike is case-insensitive
        # f"%{name}%" matches 'John', 'john', 'Johnny', or 'Elton John'
        query = query.ilike("name", f"%{name}%")

    response = query.execute()
    print(response.data)
    return response.data
