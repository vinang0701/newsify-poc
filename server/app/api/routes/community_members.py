from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.core.db import supabase
from app.services import community_members_service
 
router = APIRouter(prefix="/{inst_id}/communities/{community_id}", tags=["community-members"])
 
 
# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
 
class InviteRequest(BaseModel):
    user_ids: List[str]
 
class RoleUpdateRequest(BaseModel):
    role: str  # "community_admin" or "member"
 
 
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
async def invite_members(inst_id: str, community_id: str, body: InviteRequest):
    if not body.user_ids:
        raise HTTPException(status_code=400, detail="No user IDs provided.")
    try:
        invited, skipped = await community_members_service.invite_members(
            supabase, community_id, body.user_ids
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
    if body.role not in ("community_admin", "member"):
        raise HTTPException(
            status_code=400,
            detail="Role must be 'community_admin' or 'member'."
        )
    try:
        result = await community_members_service.update_member_role(
            supabase, community_id, user_id, body.role
        )
        if result is None:
            raise HTTPException(status_code=404, detail="Member not found.")
 
        action = "promoted to admin" if body.role == "community_admin" else "revoked to member"
        return {"message": f"Member {action} successfully.", "role": body.role}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating role: {e}")
        raise HTTPException(status_code=500, detail="Could not update member role")