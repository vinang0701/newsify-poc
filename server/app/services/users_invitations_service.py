from datetime import datetime, timezone
from app.core.db import supabase


async def get_user_invitations(user_id: str) -> list[dict]:
    response = (
        supabase.table("community_invitations")
        .select(
            """
            invitation_id,
            community_id,
            invited_user_id,
            invited_by_user_id,
            status,
            created_at,
            responded_at,
            community:communities!community_invitations_community_id_fkey(name),
            inviter:users!community_invitations_invited_by_user_id_fkey(name, image_url)
            """
        )
        .eq("invited_user_id", user_id)
        .order("status", desc=False)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


def map_invitations(rows: list[dict]) -> list[dict]:
    mapped_rows = []

    for item in rows:
        community_data = item.get("community") or {}
        inviter_data = item.get("inviter") or {}

        if isinstance(community_data, list):
            community_data = community_data[0] if community_data else {}

        if isinstance(inviter_data, list):
            inviter_data = inviter_data[0] if inviter_data else {}

        mapped_rows.append(
            {
                "id": str(item["invitation_id"]),
                "community_id": str(item["community_id"]),
                "community_name": community_data.get("name", "Unknown Community"),
                "inviter_name": inviter_data.get("name", "Unknown User"),
                "inviter_avatar_url": inviter_data.get("image_url"),
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

    now = datetime.now(timezone.utc).isoformat()

    if action == "accepted":
        existing_membership_response = (
            supabase.table("community_members")
            .select("*")
            .eq("community_id", invitation["community_id"])
            .eq("user_id", user_id)
            .execute()
        )

        existing_membership = existing_membership_response.data or []

        if not existing_membership:
            supabase.table("community_members").insert(
                {
                    "user_id": user_id,
                    "community_id": invitation["community_id"],
                    "joined_at": now,
                    "role": "member",
                }
            ).execute()

        (
            supabase.table("community_invitations")
            .update(
                {
                    "status": "accepted",
                    "responded_at": now,
                }
            )
            .eq("invitation_id", invitation_id)
            .execute()
        )

        return

    if action == "declined":
        (
            supabase.table("community_invitations")
            .delete()
            .eq("invitation_id", invitation_id)
            .execute()
        )

        return