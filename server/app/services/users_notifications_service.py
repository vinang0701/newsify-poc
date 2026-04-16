from app.core.db import supabase


async def get_user_notifications(user_id: str) -> list[dict]:
    response = (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


async def get_unread_notification_count(user_id: str) -> int:
    response = (
        supabase.table("notifications")
        .select("notification_id", count="exact")
        .eq("user_id", user_id)
        .eq("is_read", False)
        .execute()
    )
    return response.count or 0


def map_notifications(rows: list[dict]) -> list[dict]:
    mapped_rows = []

    for item in rows:
        mapped_rows.append(
            {
                "id": str(item["notification_id"]),
                "type": item.get("type", "system"),
                "title": item.get("title", "Notification"),
                "body": item.get("body"),
                "created_at": item["created_at"],
                "is_read": item.get("is_read", False),
                "actor_name": item.get("actor_name"),
                "actor_avatar_url": item.get("actor_avatar_url"),
                "metadata": item.get("metadata"),
            }
        )

    return mapped_rows


async def mark_notification_as_read(user_id: str, notification_id: str) -> None:
    existing = (
        supabase.table("notifications")
        .select("notification_id,user_id")
        .eq("notification_id", notification_id)
        .single()
        .execute()
    )

    if not existing.data:
        raise ValueError("Notification not found")

    if existing.data["user_id"] != user_id:
        raise PermissionError("You cannot update this notification")

    (
        supabase.table("notifications")
        .update({"is_read": True})
        .eq("notification_id", notification_id)
        .execute()
    )


async def mark_all_notifications_as_read(user_id: str) -> None:
    (
        supabase.table("notifications")
        .update({"is_read": True})
        .eq("user_id", user_id)
        .eq("is_read", False)
        .execute()
    )