from supabase import Client
from app.models.registeredUsers import UserRequestItem


async def get_user_community_creation_requests(
    supabase: Client, user_id: str
) -> list[dict]:
    response = (
        supabase.table("community_creation_requests")
        .select("*")
        .eq("requested_by_user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    if response.data is None:
        return None

    return [
        UserRequestItem(
            id=item.get("request_id"),
            request_type="community_application",
            title=item.get("community_name", "Community request"),
            subtitle=item.get("description"),
            community_name=item.get("community_name"),
            status=item.get("status", "pending"),
            rejection_reason=item.get("rejection_reason"),
            created_at=item.get("created_at"),
        )
        for item in response.data
    ]


async def get_user_post_requests(supabase: Client, user_id: str) -> list[dict]:
    response = (
        supabase.table("community_post_requests")
        .select(
            "*, community:communities(name), post:news_posts!request_id(title, description)"
        )
        .eq("requested_by_user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    if response.data is None:
        return None

    return [
        UserRequestItem(
            id=item.get("request_id"),
            request_type="post_request",
            title=(
                item.get("post", {}).get("title")
                if item.get("post")
                else "Untitled Post"
            ),
            subtitle=item.get("post", {}).get("description"),
            community_name=(
                item.get("community", [{}]).get("name")
                if item.get("community")
                else "Unknown Community"
            ),
            status=item.get("status", "pending"),
            rejection_reason=item.get("rejection_reason"),
            created_at=item.get("created_at"),
        )
        for item in response.data
    ]


async def get_all_user_requests(supabase: Client, user_id: str) -> list[dict]:
    community_rows = await get_user_community_creation_requests(
        supabase=supabase, user_id=user_id
    )
    post_rows = await get_user_post_requests(supabase=supabase, user_id=user_id)

    # all_requests = [
    #     *map_community_creation_requests(community_rows),
    #     *map_post_requests(post_rows),
    # ]

    all_requests = [*community_rows, *post_rows]

    all_requests.sort(key=lambda item: item.created_at, reverse=True)
    return all_requests
