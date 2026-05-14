from supabase import Client
from typing import List, Optional
from app.models.community import Community, CommunityMembers
from app.models.registeredUsers import (
    UserProfileDetails,
    UserFollowing,
    UserFollowers,
    RegisteredUser,
)
from app.core.db import supabase


# join table between communities and community_members
async def get_user_communities(
    supabase: Client, inst_id: str, user_id: str, search: Optional[str] = None
) -> List[Community]:
    query = (
        supabase.table("communities")
        .select(
            "*, member_info:community_members!inner(role), member_count:community_members(count)"
        )
        .eq("inst_id", inst_id)
        .eq("community_members.user_id", user_id)
        .eq("status", "active")
        .eq("member_info.status", "active")
        .order("name", desc=False)
    )
    if search:
        query = query.ilike("name", f"%{search}%")

    response = query.execute()

    formatted_communities = []
    for comm in response.data:
        # 1. Extract user role from the filtered join
        # Because of !inner and the .eq filter, this will always have 1 item
        user_info = comm.get("member_info", [{}])[0]

        # 2. Extract total community member count
        count_list = comm.get("member_count", [])
        total_count = count_list[0].get("count", 0) if count_list else 0

        # 3. Flatten into Pydantic model
        comm["role"] = user_info.get("role")
        comm["isMember"] = True  # Implicitly true because of !inner join
        comm["member_count"] = total_count

        comm["member_status"] = user_info.get("status")

        formatted_communities.append(Community(**comm))

    return formatted_communities


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
    return response.data


async def get_user_data(supabase: Client, inst_id: str, user_id: str):
    user = (
        supabase.table("users")
        .select("*")
        .eq("inst_id", inst_id)
        .eq("id", user_id)
        .limit(1)
        .single()
        .execute()
    )

    return RegisteredUser(**user.data)


async def suspend_news_post(supabase: Client, inst_id: str, user_id: str, post_id: str):
    result = (
        supabase.table("news_posts")
        .update({"status": "suspended"})
        .eq("inst_id", inst_id)
        .eq("author", user_id)
        .eq("id", post_id)
        .execute()
    )

    if len(result.data) > 0:
        return True

    return False
