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
from datetime import datetime

# join table between communities and community_members


async def get_user_communities(
    supabase: Client,
    inst_id: str,
    profile_user_id: str,  # The profile being viewed
    current_user_id: str,  # The logged-in user looking at the profile
    search: Optional[str] = None,
) -> List[Community]:

    # 1. We keep !inner on profile_user_id because we ONLY want communities THAT profile has joined.
    # 2. We use a regular join (no !inner) for current_user_id so it acts as an optional lookup.
    query = (
        supabase.table("communities")
        .select("""
            *, 
            profile_info:community_members!inner(status),
            current_user_info:community_members(role, status),
            member_count:community_members(count)
            """)
        .eq("inst_id", inst_id)
        .eq("status", "active")
        # Filters communities strictly down to what the target profile is actively in
        .eq("profile_info.user_id", profile_user_id)
        .eq("profile_info.status", "active")
        # Attaches the logged-in user's relationship state to those communities (if any)
        .eq("current_user_info.user_id", current_user_id)
        .order("name", desc=False)
    )

    if search:
        query = query.ilike("name", f"%{search}%")

    response = query.execute()

    formatted_communities = []
    for comm in response.data:
        # Extract total community member count
        count_list = comm.get("member_count", [])
        total_count = count_list[0].get("count", 0) if count_list else 0

        # Extract current logged-in user's info (might be empty list if they aren't a member)
        current_user_list = comm.get("current_user_info", [])
        has_membership = (
            len(current_user_list) > 0
            and current_user_list[0].get("status") == "active"
        )

        user_info = current_user_list[0] if len(current_user_list) > 0 else {}

        # Construct payload matching your Pydantic model structure
        comm["role"] = user_info.get("role") if has_membership else None
        comm["member_status"] = (
            user_info.get("status") if len(current_user_list) > 0 else None
        )

        # If viewing my own profile, profile_user_id == current_user_id, this cleanly turns out True.
        # If viewing someone else's profile, it dynamically evaluates whether you are in it or not.
        comm["isMember"] = has_membership
        comm["member_count"] = total_count

        formatted_communities.append(Community(**comm))

    return formatted_communities


"""
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
"""


async def get_user_profile(supabase: Client, inst_id: str, user_id: str) -> List[dict]:
    response = (
        supabase.table("users")
        .select("id, name, description, image_url")
        .eq("id", user_id)
        .execute()
    )
    return [
        UserProfileDetails(
            id=user["id"],
            name=user["name"],
            description=user["description"],
            image_url=user["image_url"],
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

    notification_data = {
        "recipient_user_id": followed_user_id,
        "actor_user_id": user_id,
        "notification_type": "FOLLOW",
        "reference_id": user_id,
        "reference_table": "users",
        "message": "has followed you.",
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
    }

    insert_notification = (
        supabase.table("notifications").insert(notification_data).execute()
    )
    print(insert_notification)

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
        .update({"status": "SUSPENDED"})
        .eq("inst_id", inst_id)
        .eq("author", user_id)
        .eq("id", post_id)
        .execute()
    )

    if len(result.data) > 0:
        return True

    return False
