import uuid
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, File, Query
from pydantic import BaseModel
from openai import OpenAI

from app.services import (
    users_service,
    news_service,
    communities_service,
    requests_service,
    users_notifications_service,
    users_invitations_service,
)
from app.core.db import supabase
from app.core.config import settings
from app.schemas.requests import UserRequestsResponse
from app.schemas.notifications import (
    NotificationsListResponse,
    InvitationsListResponse,
    UnreadCountResponse,
    GenericMessageResponse,
    InvitationActionRequest,
)
from app.dependencies.auth import get_current_user

router = APIRouter(tags=["users"])
client = OpenAI(api_key=settings.OPENAI_API_KEY)


class UserPublishPostBody(BaseModel):
    user_id: uuid.UUID
    image: UploadFile
    title: str
    content: str
    school: str
    communities: List[uuid.UUID]

    def print_content(self):
        print(self.content)


class JoinCommunityRequest(BaseModel):
    community_id: uuid.UUID
    user_id: uuid.UUID | None = None


def moderate_text(text: str):
    print("Moderating text...")
    response = client.moderations.create(
        model="omni-moderation-latest",
        input=text,
    )
    print(response.results)
    print("Checking for flag...")
    print(response.results[0].flagged)
    return response.results[0].flagged


@router.post("/users/create")
async def create_post_preview(item: UserPublishPostBody):
    moderation = moderate_text(item.content)

    return {
        "content": item.content,
        "moderation": moderation,
    }


# ----------------------------
# SELF / AUTHENTICATED USER ROUTES
# ----------------------------

@router.get("/users/me/requests", response_model=UserRequestsResponse)
async def get_my_requests(
    current_user=Depends(get_current_user),
):
    try:
        user_id = current_user.id
        requests = await requests_service.get_all_user_requests(user_id)
        return {"requests": requests}
    except Exception as e:
        print(f"Requests Fetch Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/me/notifications", response_model=NotificationsListResponse)
async def get_my_notifications(
    current_user=Depends(get_current_user),
):
    try:
        user_id = current_user.id
        rows = await users_notifications_service.get_user_notifications(user_id)
        return {"items": users_notifications_service.map_notifications(rows)}
    except Exception as e:
        print(f"My Notifications Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/me/notifications/unread-count", response_model=UnreadCountResponse)
async def get_my_notifications_unread_count(
    current_user=Depends(get_current_user),
):
    try:
        user_id = current_user.id
        unread_count = await users_notifications_service.get_unread_notification_count(
            user_id
        )
        return {"unread_count": unread_count}
    except Exception as e:
        print(f"My Notifications Unread Count Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/users/me/notifications/{notification_id}/read",
    response_model=GenericMessageResponse,
)
async def mark_my_notification_as_read(
    notification_id: str,
    current_user=Depends(get_current_user),
):
    try:
        user_id = current_user.id
        await users_notifications_service.mark_notification_as_read(
            user_id, notification_id
        )
        return {"message": "Notification marked as read"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        print(f"Mark My Notification Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/users/me/notifications/read-all", response_model=GenericMessageResponse)
async def mark_all_my_notifications_as_read(
    current_user=Depends(get_current_user),
):
    try:
        user_id = current_user.id
        await users_notifications_service.mark_all_notifications_as_read(user_id)
        return {"message": "All notifications marked as read"}
    except Exception as e:
        print(f"Read All My Notifications Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/me/invitations", response_model=InvitationsListResponse)
async def get_my_invitations(
    current_user=Depends(get_current_user),
):
    try:
        user_id = current_user.id
        rows = await users_invitations_service.get_user_invitations(user_id)
        return {"items": users_invitations_service.map_invitations(rows)}
    except Exception as e:
        print(f"My Invitations Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/users/me/invitations/{invitation_id}/respond",
    response_model=GenericMessageResponse,
)
async def respond_to_my_invitation(
    invitation_id: str,
    payload: InvitationActionRequest,
    current_user=Depends(get_current_user),
):
    try:
        user_id = current_user.id
        await users_invitations_service.respond_to_invitation(
            user_id, invitation_id, payload.action
        )
        return {"message": f"Invitation {payload.action}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        print(f"Respond My Invitation Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/me/communities")
async def get_my_communities(
    inst_id: str = Query(...),
    current_user=Depends(get_current_user),
):
    user_id = current_user.id
    user_communities = await users_service.get_user_communities(
        supabase, inst_id, user_id
    )

    if user_communities is None or len(user_communities) == 0:
        raise HTTPException(status_code=404, detail="No communities found")
    return user_communities


@router.get("/users/me/news")
async def get_my_news(current_user=Depends(get_current_user)):
    user_id = current_user.id
    my_news = await news_service.get_user_news(supabase, user_id)
    if my_news is None or len(my_news) == 0:
        raise HTTPException(status_code=404, detail="No news found")
    return my_news


@router.post("/users/me/news")
async def create_news_post(
    inst_id: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    school: str = Form(...),
    communities: list[str] = Form(...),
    image: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    try:
        user_id = current_user.id
        isSchool = school == "true"

        await news_service.create_post(
            supabase, inst_id, user_id, image, title, content, isSchool, communities
        )

        return {
            "status": "success",
            "message": "You have successfully published your news post.",
        }
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")


@router.post("/users/me/drafts")
async def save_draft(
    title: str | None = Form(None),
    content: str | None = Form(None),
    image: UploadFile | None = File(None),
    current_user=Depends(get_current_user),
):
    try:
        user_id = current_user.id
        response = await news_service.save_draft(
            supabase, user_id, image, title, content
        )

        return {
            "status": "success",
            "message": "Draft saved successfully",
            "data": response[0] if response else None,
        }

    except Exception as e:
        print(f"Draft Save Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="We couldn't save your draft right now. Please try again.",
        )


@router.get("/users/me/drafts")
async def get_user_drafts(current_user=Depends(get_current_user)):
    user_id = current_user.id
    user_drafts = await news_service.get_user_drafts(supabase, user_id)
    if user_drafts is None or len(user_drafts) == 0:
        raise HTTPException(status_code=404, detail="No drafts found")
    return user_drafts


@router.post("/users/me/following")
async def follow_user(
    user_id: str,
    current_user=Depends(get_current_user),
):
    try:
        result = await users_service.follow_user(
            supabase, str(current_user.id), user_id
        )

        return {
            "status": "success",
            "message": "Succesfully followed!",
            "data": result,
        }
    except Exception as e:
        if "duplicate key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Already following user.")

        raise HTTPException(status_code=500, detail="Failed to follow user")
        print(str(current_user.id))


@router.delete("/users/me/following/{user_id}")
async def unfollow_user(
    user_id: str,
    current_user=Depends(get_current_user),
):
    try:
        result = await users_service.unfollow_user(
            supabase, str(current_user.id), user_id
        )
        return {
            "status": "success",
            "message": "Successfully unfollowed.",
            "data": result,
        }
    except Exception as e:
        print(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail="Could not unfollow")


@router.delete("/users/me/communities/{community_id}")
async def leave_community(
    community_id: str,
    current_user=Depends(get_current_user),
):
    try:
        result = await communities_service.leave_community(
            supabase, community_id, str(current_user.id)
        )
        return {
            "status": "success",
            "message": "You have successfully left the community.",
            "data": result,
        }
    except Exception as e:
        print(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail="Could not leave community")


@router.post("/users/me/communities")
async def join_community(
    body: JoinCommunityRequest,
    current_user=Depends(get_current_user),
):
    try:
        result = await communities_service.join_community(
            supabase, str(body.community_id), str(current_user.id)
        )

        return {
            "status": "success",
            "message": "Welcome to the community!",
            "data": result,
        }
    except Exception as e:
        if "duplicate key" in str(e).lower():
            raise HTTPException(status_code=400, detail="You are already a member.")

        raise HTTPException(status_code=500, detail="Failed to join community")


# ----------------------------
# INSTITUTION-SCOPED / OTHER USER ROUTES
# ----------------------------

@router.get("/{inst_id}/users/{user_id}/news")
async def get_user_news(inst_id: str, user_id: str):
    my_news = await news_service.get_user_news(supabase, user_id)
    if my_news is None or len(my_news) == 0:
        raise HTTPException(status_code=404, detail="No news found")
    return my_news


@router.get("/{inst_id}/users/{user_id}/following")
async def get_user_following(inst_id: str, user_id: str):
    user_following = await users_service.get_user_following(supabase, inst_id, user_id)
    return user_following


@router.get("/{inst_id}/users/{user_id}/following_count")
async def get_following_count(inst_id: str, user_id: str):
    user_following = await users_service.get_user_following(supabase, inst_id, user_id)
    return {"count": len(user_following)}


@router.get("/{inst_id}/users/{user_id}/followers")
async def get_user_followers(inst_id: str, user_id: str):
    user_followers = await users_service.get_user_followers(supabase, inst_id, user_id)
    return user_followers


@router.get("/{inst_id}/users/{user_id}/follower_count")
async def get_follower_count(inst_id: str, user_id: str):
    user_followers = await users_service.get_user_followers(supabase, inst_id, user_id)
    return {"count": len(user_followers)}


@router.get("/{inst_id}/users/{user_id}")
async def get_user_profile(inst_id: str, user_id: str):
    user_profile = await users_service.get_user_profile(supabase, inst_id, user_id)
    if user_profile is None or len(user_profile) == 0:
        raise HTTPException(status_code=404, detail="No profile details found")
    return user_profile


@router.get("/{inst_id}/users")
async def search_users(
    inst_id: str,
    name: Optional[str] = Query(None, min_length=1),
):
    try:
        result = await users_service.find_users_by_name(supabase, inst_id, name)
        return result
    except Exception as e:
        print(f"Search Error: {e}")
        raise HTTPException(status_code=500, detail="Error searching users")