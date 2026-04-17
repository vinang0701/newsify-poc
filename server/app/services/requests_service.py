from app.core.db import supabase


async def get_user_community_creation_requests(user_id: str) -> list[dict]:
    response = (
        supabase.table("community_creation_requests")
        .select("*")
        .eq("requested_by_user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


async def get_user_post_requests(user_id: str) -> list[dict]:
    response = (
        supabase.table("community_post_requests")
        .select("*")
        .eq("requested_by_user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


def map_community_creation_requests(rows: list[dict]) -> list[dict]:
    mapped_rows = []

    for item in rows:
        mapped_rows.append(
            {
                "id": str(item["request_id"]),
                "request_type": "community_application",
                "title": item.get("community_name", "Community request"),
                "subtitle": item.get("description"),
                "community_name": item.get("community_name"),
                "status": item.get("status", "pending"),
                "rejection_reason": item.get("rejection_reason"),
                "created_at": item["created_at"],
            }
        )

    return mapped_rows


def map_post_requests(rows: list[dict]) -> list[dict]:
    mapped_rows = []

    for item in rows:
        mapped_rows.append(
            {
                "id": str(item["request_id"]),
                "request_type": "post_request",
                "title": item.get("community_name", "Post request"),
                "subtitle": item.get("description"),
                "community_name": item.get("community_name"),
                "status": item.get("status", "pending"),
                "rejection_reason": item.get("rejection_reason"),
                "created_at": item["created_at"],
            }
        )

    return mapped_rows


async def get_all_user_requests(user_id: str) -> list[dict]:
    community_rows = await get_user_community_creation_requests(user_id)
    post_rows = await get_user_post_requests(user_id)

    all_requests = [
        *map_community_creation_requests(community_rows),
        *map_post_requests(post_rows),
    ]

    all_requests.sort(key=lambda item: item["created_at"], reverse=True)
    return all_requests