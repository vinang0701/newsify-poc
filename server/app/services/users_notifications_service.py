from app.core.db import supabase
from app.schemas.notifications import NotificationItem


async def get_user_notifications(user_id: str) -> list[dict]:
    response = (
        supabase.table("user_notifications_view")
        .select("*")
        .eq("recipient_user_id", user_id)
        .execute()
    )
    return [NotificationItem(**item) for item in response.data]
    # return response.data or []


async def get_unread_notification_count(user_id: str) -> int:
    response = (
        supabase.table("notifications")
        .select("notification_id", count="exact")
        .eq("recipient_user_id", user_id)
        .eq("is_read", False)
        .execute()
    )
    return response.count or 0


async def mark_notification_as_read(user_id: str, notification_id: str) -> None:
    existing = (
        supabase.table("notifications")
        .select("notification_id,recipient_user_id")
        .eq("notification_id", notification_id)
        .single()
        .execute()
    )

    if not existing.data:
        raise ValueError("Notification not found")

    if existing.data["recipient_user_id"] != user_id:
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
        .eq("recipient_user_id", user_id)
        .eq("is_read", False)
        .execute()
    )
