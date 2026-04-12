from fastapi import APIRouter, Depends, HTTPException

from app.core.supabase_client import supabase
from app.dependencies.auth import get_current_user
from app.schemas.notifications import (
    GenericMessageResponse,
    InvitationActionRequest,
    NotificationsResponse,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationsResponse)
async def get_notifications(current_user=Depends(get_current_user)):
    user_id = current_user.id

    try:
        notifications_response = (
            supabase.table("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        invitations_response = (
            supabase.table("community_invitations")
            .select("*")
            .eq("invited_user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        notifications = notifications_response.data or []
        invitations = invitations_response.data or []

        unread_count = sum(
            1 for notification in notifications if not notification.get("is_read", False)
        )

        return {
            "notifications": [
                {
                    "id": str(notification["id"]),
                    "type": notification["type"],
                    "title": notification["title"],
                    "body": notification.get("body"),
                    "created_at": notification["created_at"],
                    "is_read": notification.get("is_read", False),
                    "actor_name": notification.get("actor_name"),
                    "actor_avatar_url": notification.get("actor_avatar_url"),
                    "metadata": notification.get("metadata"),
                }
                for notification in notifications
            ],
            "invitations": [
                {
                    "id": str(invitation["id"]),
                    "community_id": str(invitation["community_id"]),
                    "community_name": invitation["community_name"],
                    "inviter_name": invitation.get("inviter_name"),
                    "inviter_avatar_url": invitation.get("inviter_avatar_url"),
                    "status": invitation["status"],
                    "created_at": invitation["created_at"],
                }
                for invitation in invitations
            ],
            "unread_count": unread_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{notification_id}/read", response_model=GenericMessageResponse)
async def mark_notification_as_read(
    notification_id: str,
    current_user=Depends(get_current_user),
):
    user_id = current_user.id

    try:
        existing = (
            supabase.table("notifications")
            .select("id,user_id,is_read")
            .eq("id", notification_id)
            .single()
            .execute()
        )

        if not existing.data:
            raise HTTPException(status_code=404, detail="Notification not found")

        if existing.data["user_id"] != user_id:
            raise HTTPException(
                status_code=403,
                detail="You cannot update this notification",
            )

        (
            supabase.table("notifications")
            .update({"is_read": True})
            .eq("id", notification_id)
            .execute()
        )

        return {"message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/read-all", response_model=GenericMessageResponse)
async def mark_all_notifications_as_read(current_user=Depends(get_current_user)):
    user_id = current_user.id

    try:
        (
            supabase.table("notifications")
            .update({"is_read": True})
            .eq("user_id", user_id)
            .eq("is_read", False)
            .execute()
        )

        return {"message": "All notifications marked as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/invitations/{invitation_id}/respond", response_model=GenericMessageResponse)
async def respond_to_invitation(
    invitation_id: str,
    payload: InvitationActionRequest,
    current_user=Depends(get_current_user),
):
    user_id = current_user.id
    action = payload.action

    if action not in ["accepted", "declined"]:
        raise HTTPException(
            status_code=400,
            detail="Action must be accepted or declined",
        )

    try:
        invitation_response = (
            supabase.table("community_invitations")
            .select("*")
            .eq("id", invitation_id)
            .single()
            .execute()
        )

        invitation = invitation_response.data

        if not invitation:
            raise HTTPException(status_code=404, detail="Invitation not found")

        if invitation["invited_user_id"] != user_id:
            raise HTTPException(
                status_code=403,
                detail="You cannot respond to this invitation",
            )

        if invitation["status"] != "pending":
            raise HTTPException(
                status_code=400,
                detail="Invitation already handled",
            )

        (
            supabase.table("community_invitations")
            .update({"status": action})
            .eq("id", invitation_id)
            .execute()
        )

        return {"message": f"Invitation {action}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))