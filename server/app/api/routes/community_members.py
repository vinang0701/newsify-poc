from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from app.core.db import supabase
from app.services import community_members_service, communities_service
from app.core.auth import UserPayload, get_current_app_user, get_current_user

router = APIRouter(
    prefix="/{inst_id}/communities/{community_id}",
    tags=["community-members"],
    dependencies=[Depends(get_current_user)],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class InviteRequest(BaseModel):
    user_ids: List[str]


class RoleUpdateRequest(BaseModel):
    role: str  # "community_admin" or "member"


class MembershipUpdate(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# GET /members — list all members, admins shown with badge
# ---------------------------------------------------------------------------


@router.get("/members")
async def get_members(inst_id: str, community_id: str):
    try:
        members = await community_members_service.get_members_by_community(
            supabase, community_id
        )
        return members
    except Exception as e:
        print(f"Error fetching members: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch community members")


# ---------------------------------------------------------------------------
# GET /invitable-members — users not yet in the community (for invite screen)
# ---------------------------------------------------------------------------


@router.get("/invitable-members")
async def get_invitable_members(inst_id: str, community_id: str):
    try:
        users = await community_members_service.get_invitable_members(
            supabase, community_id, inst_id
        )
        return users
    except Exception as e:
        print(f"Error fetching invitable members: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch invitable members")


# ---------------------------------------------------------------------------
# POST /members/invite — invite one or more users
# ---------------------------------------------------------------------------


@router.post("/members/invite")
async def invite_members(
    inst_id: str,
    community_id: str,
    body: InviteRequest,
    app_user: UserPayload = Depends(get_current_app_user),
):
    if not body.user_ids:
        raise HTTPException(status_code=400, detail="No user IDs provided.")
    try:
        invited_by_user_id = app_user["id"]
        invited, skipped = await community_members_service.invite_members(
            supabase, community_id, body.user_ids, invited_by_user_id=invited_by_user_id
        )
        return {
            "message": f"Successfully invited {len(invited)} member(s).",
            "invited": invited,
            "skipped": skipped,
        }
    except Exception as e:
        print(f"Error inviting members: {e}")
        raise HTTPException(status_code=500, detail="Could not invite members")


# ---------------------------------------------------------------------------
# DELETE /members/{user_id} — remove a member
# ---------------------------------------------------------------------------


@router.delete("/members/{user_id}")
async def remove_member(inst_id: str, community_id: str, user_id: str):
    try:
        await community_members_service.remove_member(supabase, community_id, user_id)
        return {"message": "Member removed successfully."}
    except Exception as e:
        print(f"Error removing member: {e}")
        raise HTTPException(status_code=500, detail="Could not remove member")


# ---------------------------------------------------------------------------
# POST /members/{user_id}/ban — ban a member
# ---------------------------------------------------------------------------


@router.post("/members/{user_id}/ban")
async def ban_member(inst_id: str, community_id: str, user_id: str):
    try:
        result = await community_members_service.ban_member(
            supabase, community_id, user_id
        )
        return result
    except Exception as e:
        print(f"Error banning member: {e}")
        raise HTTPException(status_code=500, detail="Could not ban member")


# ---------------------------------------------------------------------------
# PATCH /members/{user_id}/role — promote to admin or revoke
# ---------------------------------------------------------------------------


@router.patch("/members/{user_id}/role")
async def update_member_role(
    inst_id: str, community_id: str, user_id: str, body: RoleUpdateRequest
):
    if body.role not in ("admin", "member"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'member'.")
    try:
        result = await community_members_service.update_member_role(
            supabase, community_id, user_id, body.role
        )
        if result is None:
            raise HTTPException(status_code=404, detail="Member not found.")

        action = "promoted to admin" if body.role == "admin" else "revoked to member"
        return {"message": f"Member {action} successfully.", "role": body.role}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating role: {e}")
        raise HTTPException(status_code=500, detail="Could not update member role")


# ---------------------------------------------------------------------------
# PATCH /members/{user_id}/status — update membership for private communities
# ---------------------------------------------------------------------------
@router.patch("/members/{user_id}/status")
async def handle_membership_request(
    community_id: str,
    user_id: str,
    payload: MembershipUpdate,
    current_user=Depends(get_current_app_user),
):
    try:
        result = await communities_service.update_membership_status(
            supabase=supabase,
            community_id=community_id,
            user_id=user_id,
            new_status=payload.status,
            admin_user_id=current_user["id"],
        )

        if not result:
            raise HTTPException(status_code=404, detail="Membership request not found.")

        verb = "approved" if payload.status == "active" else "rejected"
        return {
            "status": "success",
            "message": f"Member has been successfully {verb}.",
            "data": result[0],
        }

    except Exception as e:
        print(f"Error updating membership: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to process membership request."
        )
