from supabase import Client
from typing import List
import uuid


# ---------------------------------------------------------------------------
# Get all members with their role (admins sorted first)
# ---------------------------------------------------------------------------
async def get_members_by_community(supabase: Client, community_id: str):
    response = (
        supabase.table("community_members")
        .select("role, users(id, name)")
        .eq("community_id", community_id)
        .execute()
    )

    members = [
        {
            "community_id": community_id,
            "user_id": m["users"]["id"],
            "name": m["users"]["name"],
            "role": m.get("role", "member"),
        }
        for m in response.data
        if m.get("users")
    ]

    # Admins first, then alphabetically by name
    members.sort(key=lambda m: (0 if m["role"] == "community_admin" else 1, m["name"]))

    return members


# ---------------------------------------------------------------------------
# Get users NOT already in the community (for invite screen)
# ---------------------------------------------------------------------------
async def get_invitable_members(supabase: Client, community_id: str, inst_id: str):
    # changed to rpc to reduce memory load
    res = supabase.rpc(
        "get_eligible_users",
        {"target_community_id": community_id, "target_inst_id": inst_id},
    ).execute()

    return [
        {
            "community_id": community_id,
            "user_id": u["user_id"],
            "name": u["name"],
            "role": "member",
        }
        for u in res.data
    ]


# ---------------------------------------------------------------------------
# Invite multiple users into a community
# ---------------------------------------------------------------------------
async def invite_members(
    supabase: Client, community_id: str, user_ids: List[str], invited_by_user_id: str
):
    # Get already existing members to skip them
    existing_res = (
        supabase.table("community_members")
        .select("user_id")
        .eq("community_id", community_id)
        .execute()
    )
    existing_ids = {m["user_id"] for m in existing_res.data}

    # Get banned ids to skip them
    banned_res = (
        supabase.table("banned_members")
        .select("user_id")
        .eq("community_id", community_id)
        .execute()
    )
    banned_ids = {b["user_id"] for b in banned_res.data}

    invited = []
    skipped = []

    for uid in user_ids:
        if uid in existing_ids or uid in banned_ids:
            skipped.append(uid)
            continue

        # supabase.table("community_members").insert({
        #     "community_id": community_id,
        #     "user_id": uid,
        #     "role": "member",
        #     "joined_at": "now()",
        # }).execute()
        supabase.table("community_invitations").insert(
            {
                "community_id": community_id,
                "invited_user_id": uid,
                "invited_by_user_id": invited_by_user_id,
                "status": "pending",
            }
        ).execute()

        invited.append(uid)

    return invited, skipped


# ---------------------------------------------------------------------------
# Remove a member from a community
# ---------------------------------------------------------------------------
async def remove_member(supabase: Client, community_id: str, user_id: str):
    response = (
        supabase.table("community_members")
        .delete()
        .eq("community_id", community_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data


# ---------------------------------------------------------------------------
# Ban a member (remove + add to banned_members table)
# ---------------------------------------------------------------------------
async def ban_member(supabase: Client, community_id: str, user_id: str):
    # Remove from community_members
    supabase.table("community_members").delete().eq("community_id", community_id).eq(
        "user_id", user_id
    ).execute()

    # Check if already banned
    already = (
        supabase.table("banned_members")
        .select("id")
        .eq("community_id", community_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not already.data:
        supabase.table("banned_members").insert(
            {
                "community_id": community_id,
                "user_id": user_id,
            }
        ).execute()

    return {"message": "Member banned successfully."}


# ---------------------------------------------------------------------------
# Update a member's role (promote to community_admin or revoke back to member)
# ---------------------------------------------------------------------------
async def update_member_role(
    supabase: Client, community_id: str, user_id: str, role: str
):
    response = (
        supabase.table("community_members")
        .update({"role": role})
        .eq("community_id", community_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]
