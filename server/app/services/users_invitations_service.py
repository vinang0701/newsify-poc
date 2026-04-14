from datetime import datetime, timezone
from app.core.db import supabase


async def get_user_invitations(user_id: str) -> list[dict]:
    response = (
        supabase.table("community_invitations")
        .select("*")
        .eq("invited_user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


def map_invitations(rows: list[dict]) -> list[dict]:
    mapped_rows = []

    for item in rows:
        mapped_rows.append(
            {
                "id": str(item["invitation_id"]),
                "community_id": str(item["community_id"]),
                "community_name": item.get("community_name", "Community"),
                "inviter_name": item.get("inviter_name"),
                "inviter_avatar_url": item.get("inviter_avatar_url"),
                "status": item.get("status", "pending"),
                "created_at": item["created_at"],
                "rejection_reason": item.get("rejection_reason"),
            }
        )

    return mapped_rows


async def respond_to_invitation(user_id: str, invitation_id: str, action: str) -> None:
    invitation_response = (
        supabase.table("community_invitations")
        .select("*")
        .eq("invitation_id", invitation_id)
        .single()
        .execute()
    )

    invitation = invitation_response.data

    if not invitation:
        raise ValueError("Invitation not found")

    if invitation["invited_user_id"] != user_id:
        raise PermissionError("You cannot respond to this invitation")

    if invitation["status"] != "pending":
        raise ValueError("Invitation already handled")

    if action not in ["accepted", "declined"]:
        raise ValueError("Action must be accepted or declined")

    (
        supabase.table("community_invitations")
        .update(
            {
                "status": action,
                "responded_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .eq("invitation_id", invitation_id)
        .execute()
    )