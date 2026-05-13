import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    Form,
    File,
    Query,
    status,
)
from pydantic import BaseModel
from openai import OpenAI

from app.services import (
    users_service,
    news_service,
    communities_service,
    requests_service,
    users_notifications_service,
    users_invitations_service,
    users_preferences_service,
    achievements_service,
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
from app.core.auth import get_current_user, get_current_app_user, UserPayload
from app.models.registeredUsers import SavePreferencesRequest
from bs4 import BeautifulSoup
import base64
import asyncio

router = APIRouter(tags=["users"], dependencies=[Depends(get_current_user)])
client = OpenAI(api_key=settings.OPENAI_API_KEY)


class JoinCommunityRequest(BaseModel):
    community_id: uuid.UUID
    user_id: uuid.UUID | None = None


class FollowRequest(BaseModel):
    followed_user_id: uuid.UUID


def extract_text_content(html_content: str):
    if not html_content:
        return ""

    # 'lxml' is faster, but 'html.parser' is built-in to Python
    soup = BeautifulSoup(html_content, "html.parser")

    # Remove script and style elements so their code isn't treated as text
    for script_or_style in soup(["script", "style"]):
        script_or_style.decompose()

    # get_text() extracts all text; strip=True removes leading/trailing whitespace
    # separator=" " ensures words don't get stuck together when tags are removed
    text = soup.get_text(separator=" ", strip=True)

    return text


THRESHOLDS = {
    # Non-negotiable safety
    "sexual/minors": 0.01,
    "hate/threatening": 0.05,
    "violence_graphic": 0.05,
    # Professionalism filters
    "sexual": 0.15,
    "hate": 0.15,
    "self-harm": 0.20,
    # Discussion filters (Allows for "heated" but not "abusive" talk)
    "harassment": 0.35,
    "violence": 0.40,
    "harassment_threatening": 0.15,
}


def moderate_text(text: str):
    try:
        print(f"Moderating text: {text[:50]}...")  # Log a snippet

        # Call the OpenAI moderation endpoint
        response = client.moderations.create(
            model="omni-moderation-latest",
            input=text,
        )

        # Accessing the first result object
        result = response.results[0]
        scores_dict = result.category_scores.model_dump()

        for category, score in scores_dict.items():
            # Formatting to 6 decimal places to make it readable
            print(f"  {category.ljust(25)}: {score:.6f}")

        custom_flagged = False
        flagged_categories = []

        print("\n--- Threshold Evaluation ---")
        for category, score in scores_dict.items():
            # Check if we have a custom threshold for this category
            threshold = THRESHOLDS.get(category, 0.5)  # Default to 0.5 if not listed

            if score > threshold:
                custom_flagged = True
                flagged_categories.append(category)
                print(f"  [!] TRIGGERED: {category}")
                print(f"      Score {score:.6f} > Threshold {threshold}")

        print(f"\nFinal Custom Flag Status: {custom_flagged}")
        print("--- Moderation Complete ---\n")

        return {
            "flagged": custom_flagged,
            "categories": flagged_categories,
            "scores": scores_dict,
        }

    except Exception as e:
        print(f"Moderation error: {e}")
        # Return a safe default to avoid breaking the calling code
        return {"flagged": False, "error": str(e)}


async def moderate_image(file: UploadFile):
    if file is None or not file.filename:
        return {"flagged": False, "categories": [], "scores": {}}
    # 1. Read file into memory
    file_bytes = await file.read()

    # 2. Encode to Base64
    base64_image = base64.b64encode(file_bytes).decode("utf-8")

    # 3. Request moderation
    response = client.moderations.create(
        model="omni-moderation-latest",
        input=[
            {
                "type": "image_url",
                "image_url": {"url": f"data:{file.content_type};base64,{base64_image}"},
            }
        ],
    )

    result = response.results[0]
    scores_dict = result.category_scores.model_dump()

    for category, score in scores_dict.items():
        # Formatting to 6 decimal places to make it readable
        print(f"  {category.ljust(25)}: {score:.6f}")

    custom_flagged = False
    flagged_categories = []

    print("\n--- Threshold Evaluation ---")
    for category, score in scores_dict.items():
        # Check if we have a custom threshold for this category
        threshold = THRESHOLDS.get(category, 0.5)  # Default to 0.5 if not listed

        if score > threshold:
            custom_flagged = True
            flagged_categories.append(category)
            print(f"  [!] TRIGGERED: {category}")
            print(f"      Score {score:.6f} > Threshold {threshold}")

    print(f"\nFinal Custom Flag Status: {custom_flagged}")
    print("--- Moderation Complete ---\n")

    return {
        "flagged": custom_flagged,
        "categories": flagged_categories,
        "scores": scores_dict,
    }


def calculate_safety_score(moderation_results: list) -> int:
    """
    Takes a list of moderation dicts and returns a safety score from 0-100.
    100 = Perfectly Safe, 0 = Extremely Harmful.
    """
    if not moderation_results:
        return 100

    max_violation_ratio = 0.0

    for res in moderation_results:
        scores = res.get("scores", {})
        # We compare the score against your specific thresholds
        # to see how "far over the line" it is.
        for category, score in scores.items():
            # Using the same thresholds from your functions
            threshold = THRESHOLDS.get(category, 0.5)

            # Ratio > 1.0 means it is flagged
            violation_ratio = score / threshold
            if violation_ratio > max_violation_ratio:
                max_violation_ratio = violation_ratio

    # If the worst violation is 0 (no probability), score is 100.
    # If the violation is exactly the threshold, score starts dropping fast.
    if max_violation_ratio <= 0.5:
        # Very safe: Map 0.0-0.5 ratio to 100%-90%
        # (max_ratio 0.0 = 100, max_ratio 0.5 = 90)
        score = 100 - (max_violation_ratio * 20)
    elif max_violation_ratio <= 1.0:
        # Near threshold: Map 0.5-1.0 ratio to 90%-85%
        # (max_ratio 0.5 = 90, max_ratio 1.0 = 85)
        score = 95 - (max_violation_ratio * 10)
    else:
        # Flagged: Map 1.0+ ratio to 84% and below
        # Each point over the threshold drops the score further
        score = 85 - (min(max_violation_ratio - 1.0, 4.0) * 20)

    return int(max(0, min(100, score)))


# ----------------------------
# SELF / AUTHENTICATED USER ROUTES
# ----------------------------


@router.get("/users/me/requests")
async def get_my_requests(
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
        requests = await requests_service.get_all_user_requests(
            supabase=supabase, user_id=user_id
        )
        return requests
    except Exception as e:
        print(f"Requests Fetch Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/me/notifications", response_model=NotificationsListResponse)
async def get_my_notifications(
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
        rows = await users_notifications_service.get_user_notifications(user_id)
        # return {"items": users_notifications_service.map_notifications(rows)}
        return {"items": rows}
    except Exception as e:
        print(f"My Notifications Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/me/notifications/unread-count", response_model=UnreadCountResponse)
async def get_my_notifications_unread_count(
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
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
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
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
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
        await users_notifications_service.mark_all_notifications_as_read(user_id)
        return {"message": "All notifications marked as read"}
    except Exception as e:
        print(f"Read All My Notifications Error: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/me/invitations", response_model=InvitationsListResponse)
async def get_my_invitations(
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
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
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
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
    search: Optional[str] = None,
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
        inst_id = app_user["inst_id"]
        user_communities = await users_service.get_user_communities(
            supabase=supabase, inst_id=inst_id, user_id=user_id, search=search
        )
        if user_communities is None:
            raise HTTPException(
                status_code=404, detail="No commmunity membership data found."
            )

        return user_communities
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error while fetching user's communities membership: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/me/news")
async def get_my_news(app_user=Depends(get_current_app_user)):
    user_id = app_user["id"]
    my_news = await news_service.get_user_news(supabase, user_id)
    if my_news is None:
        raise HTTPException(status_code=404, detail="No news found for this user")
    return my_news


@router.post("/users/me/news")
async def create_news_post(
    title: str = Form(...),
    description: str = Form(...),
    content: str = Form(...),
    category_id: str = Form(...),
    destination: str = Form(...),
    is_public: bool = Form(...),
    community_id: Optional[str] = Form(None),
    thumbnail: Optional[UploadFile] = File(None),
    content_images: list[UploadFile] = File([]),
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
        inst_id = app_user["inst_id"]

        all_results = []

        extracted_text = extract_text_content(content)
        text_res = moderate_text(title + " " + extracted_text)
        all_results.append(text_res)

        if thumbnail and thumbnail.filename:
            # Ensure cursor is at start
            await thumbnail.seek(0)
            thumb_res = await moderate_image(thumbnail)
            all_results.append(thumb_res)
            # Reset cursor after reading for the next step (uploading)
            await thumbnail.seek(0)

        if content_images:
            # Gather results for all images in the list
            content_img_results = await asyncio.gather(
                *[moderate_image(img) for img in content_images]
            )
            all_results.extend(content_img_results)

            # Crucial: Reset cursors for content images so service can read them
            for img in content_images:
                await img.seek(0)

        # 2. Check if globally flagged
        is_flagged = any(r["flagged"] for r in all_results)

        # 3. Calculate the 0-100 score
        safety_score = calculate_safety_score(all_results)
        if safety_score >= 90:
            post_status = "PUBLISHED"
        elif 80 <= safety_score < 90:
            post_status = "PENDING REVIEW"
        else:
            post_status = "REJECTED"

        await news_service.create_post(
            supabase=supabase,
            inst_id=inst_id,
            user_id=user_id,
            thumbnail=thumbnail,
            title=title,
            description=description,
            content=content,
            destination=destination,
            is_public=is_public,
            community_id=community_id,
            category_id=category_id,
            content_images=content_images,
            is_flagged=post_status,
        )

        return {
            "status": post_status,
            "score": f"{safety_score}%",
            "is_flagged": safety_score < 80,
            "flagged_categories": list(
                set([c for r in all_results for c in r["categories"]])
            ),
        }

        # if moderation["flagged"]:
        #     return {
        #         "status": "flagged",
        #         "flagged": True,
        #         "message": "This post is being reviewed by staff to ensure it follows school community guidelines.",
        #     }

        # return {
        #     "status": "success",
        #     "message": "You have successfully published your news post.",
        # }

    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to publish news post.")


@router.patch("/users/me/news/{news_id}")
async def edit_news_post(
    news_id: str,
    title: str = Form(...),
    description: str = Form(...),
    content: str = Form(...),
    thumbnail: Optional[UploadFile] = File(None),
    content_images: list[UploadFile] = File([]),
    app_user: UserPayload = Depends(get_current_app_user),
):
    # check if the user is allowed to edit this post
    # If not, early return
    post = await news_service.get_news_post_by_id(
        supabase=supabase,
        news_id=str(news_id),
        user_id=app_user["id"],
    )
    if not post or post.author_id != app_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to edit this post.",
        )

    # else, moderate the images and
    # if fail moderation, no change and return score to user
    all_results = []

    extracted_text = extract_text_content(content)
    text_res = moderate_text(title + " " + extracted_text)
    all_results.append(text_res)

    if thumbnail and thumbnail.filename:
        # Ensure cursor is at start
        await thumbnail.seek(0)
        thumb_res = await moderate_image(thumbnail)
        all_results.append(thumb_res)
        # Reset cursor after reading for the next step (uploading)
        await thumbnail.seek(0)

    if content_images:
        # Gather results for all images in the list
        content_img_results = await asyncio.gather(
            *[moderate_image(img) for img in content_images]
        )
        all_results.extend(content_img_results)

        # Crucial: Reset cursors for content images so service can read them
        for img in content_images:
            await img.seek(0)

    # 2. Check if globally flagged
    is_flagged = any(r["flagged"] for r in all_results)

    # 3. Calculate the 0-100 score
    safety_score = calculate_safety_score(all_results)
    if safety_score >= 90:
        post_status = "PUBLISHED"
    # elif 80 <= safety_score < 90:
    #     post_status = "PENDING REVIEW"
    else:
        post_status = "REJECTED"

    if post_status == "REJECTED":
        return {
            "status": post_status,
            "score": f"{safety_score}%",
            "is_flagged": safety_score < 90,
            "flagged_categories": list(
                set([c for r in all_results for c in r["categories"]])
            ),
        }

    # if pass moderation, update the thumbnail, title and content
    try:
        updated_post = await news_service.update_news_post(
            supabase=supabase,
            user_id=app_user["id"],
            news_id=news_id,
            title=title,
            content=content,
            status=post_status,
            thumbnail=thumbnail,
            content_images=content_images,
        )

        if not updated_post:
            raise HTTPException(status_code=500, detail="Update failed.")

        return {
            "status": "success",
            "post_status": post_status,
            "score": f"{safety_score}%",
            "data": updated_post[0],
        }

    except Exception as e:
        print(f"Error during post update: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while saving your changes."
        )


@router.delete("/users/me/news/{post_id}")
async def suspend_news_post(
    post_id: str, app_user: UserPayload = Depends(get_current_app_user)
):
    try:
        suspend_result = await users_service.suspend_news_post(
            supabase=supabase,
            inst_id=app_user["inst_id"],
            user_id=app_user["id"],
            post_id=post_id,
        )
        if suspend_result is False:
            return {
                "status": "error",
                "message": "Failed to suspend post.",
            }
        return {
            "status": "success",
            "message": "You have successfully suspended this news post.",
        }
    except Exception as e:
        print(f"Failed to suspend post: {e}")
        raise HTTPException(status_code=500, detail="Failed to suspend post")


@router.post("/users/me/drafts")
async def save_draft(
    draft_id: Optional[str] = Form(None),
    title: str | None = Form(None),
    content: str | None = Form(None),
    thumbnail: UploadFile | None = File(None),
    content_images: Optional[list[UploadFile]] = File([]),
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]
        response = await news_service.save_draft(
            supabase=supabase,
            user_id=user_id,
            draft_id=draft_id,
            thumbnail=thumbnail,
            title=title,
            content=content,
            content_images=content_images,
        )

        if response is None:
            return {
                "status": "error",
                "message": "Failed to save draft. Please try again later.",
            }

        return {
            "status": "success",
            "message": "Draft saved successfully",
        }

    except Exception as e:
        print(f"Draft Save Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="We couldn't save your draft right now. Please try again.",
        )


@router.get("/users/me/drafts")
async def get_user_drafts(app_user=Depends(get_current_app_user)):
    user_id = app_user["id"]
    user_drafts = await news_service.get_user_drafts(supabase, user_id)
    if user_drafts is None:
        raise HTTPException(status_code=404, detail="No drafts found")
    return user_drafts


@router.get("/users/me/drafts/{draft_id}")
async def get_draft(
    draft_id: str, app_user: UserPayload = Depends(get_current_app_user)
):
    try:
        user_id = app_user["id"]
        draft = await news_service.get_draft(
            supabase=supabase, user_id=user_id, draft_id=draft_id
        )
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")
        return draft
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch draft data.")


@router.delete("/users/me/drafts/{draft_id}")
async def delete_user_draft(
    draft_id: str, app_user: UserPayload = Depends(get_current_app_user)
):
    try:
        user_id = app_user["id"]
        response = await news_service.delete_user_draft(
            supabase=supabase, user_id=user_id, draft_id=draft_id
        )
        if response is True:
            return {
                "status": "Success",
                "message": "You have successfully deleted the draft.",
            }
        return {
            "status": "Error",
            "message": "Failed to delete draft. Please try again later.",
        }
    except Exception as e:
        print(f"Delete draft error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete draft. Please try again later.",
        )


@router.get("/users/me/following")
async def get_my_following(current_user=Depends(get_current_app_user)):
    my_following = await users_service.get_user_following(
        supabase, current_user["inst_id"], current_user["id"]
    )
    return my_following


@router.post("/users/me/following")
async def follow_user(
    body: FollowRequest,
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]

        result = await users_service.follow_user(
            supabase, str(user_id), str(body.followed_user_id)
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


@router.delete("/users/me/following/{user_id}")
async def unfollow_user(
    user_id: str,
    app_user=Depends(get_current_app_user),
):
    try:
        current_user_id = app_user["id"]

        result = await users_service.unfollow_user(
            supabase, str(current_user_id), user_id
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
    app_user=Depends(get_current_app_user),
):
    try:
        user_id = app_user["id"]

        result = await communities_service.leave_community(
            supabase, community_id, str(user_id)
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
    current_user=Depends(get_current_app_user),
):
    try:
        result = await communities_service.join_community(
            supabase, str(body.community_id), str(current_user["id"])
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


@router.post("/users/me/bookmarks")
async def save_post(body, current_user: UserPayload = Depends(get_current_app_user)):
    return []


# ----------------------------
# INSTITUTION-SCOPED / OTHER USER ROUTES
# ----------------------------
@router.get("/{inst_id}/users/{user_id}/news")
async def get_user_news(inst_id: str, user_id: str):
    my_news = await news_service.get_user_news(supabase, user_id)
    if my_news is None:
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


# Check if a post is saved by the current user
@router.get("/users/me/saved/{post_id}")
async def check_saved_post(
    post_id: str,
    current_user=Depends(get_current_app_user),
):
    try:
        user_id = current_user["id"]
        is_saved = await news_service.is_post_saved(supabase, str(user_id), post_id)
        return {"is_saved": is_saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not check saved status")


# Save a post
@router.post("/users/me/saved/{post_id}")
async def save_post(
    post_id: str,
    current_user=Depends(get_current_app_user),
):
    try:
        user_id = current_user["id"]
        await news_service.save_post(supabase, str(user_id), post_id)
        return {"status": "success", "message": "Post saved successfully"}
    except Exception as e:
        # If already saved, duplicate key error will be thrown
        if "duplicate key" in str(e).lower():
            raise HTTPException(status_code=400, detail="Post already saved")
        raise HTTPException(status_code=500, detail="Could not save post")


# Unsave a post
@router.delete("/users/me/saved/{post_id}")
async def unsave_post(
    post_id: str,
    current_user=Depends(get_current_app_user),
):
    try:
        user_id = current_user["id"]
        await news_service.unsave_post(supabase, str(user_id), post_id)
        return {"status": "success", "message": "Post unsaved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not unsave post")


# Get all saved posts for current user
@router.get("/users/me/saved")
async def get_saved_posts(
    current_user=Depends(get_current_app_user),
):
    try:
        user_id = current_user["id"]
        saved_posts = await news_service.get_saved_posts(supabase, str(user_id))
        return saved_posts
    except Exception as e:
        print(f"Could not fetch saved posts: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch saved posts")


@router.get("/users/me/preferences")
async def get_user_preferences(
    current_user: UserPayload = Depends(get_current_app_user),
):
    user_id = current_user["id"]
    user_preferences = await users_preferences_service.get_user_preferences(
        supabase=supabase, user_id=user_id
    )
    return user_preferences


@router.post("/users/me/preferences")
async def update_preferences(
    payload: SavePreferencesRequest,
    current_user: UserPayload = Depends(get_current_app_user),
):
    try:
        user_id = current_user["id"]
        success = await users_preferences_service.save_user_preferences(
            supabase=supabase,
            user_id=user_id,
            preferences=payload.preferences,  # Passing the list of objects
        )

        if not success:
            raise HTTPException(status_code=400, detail="Failed to save preferences")

        return {"message": "Preferences synchronized successfully"}

    except Exception as e:
        print(f"Error saving preferences: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/users/me")
async def get_user_data(current_user: UserPayload = Depends(get_current_app_user)):
    try:
        user = await users_service.get_user_data(
            supabase=supabase,
            inst_id=current_user["inst_id"],
            user_id=current_user["id"],
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )

        return user
    except Exception as e:
        # Log the actual error 'e' here for internal debugging
        print(f"Error fetching user data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving user data",
        )


# server/app/api/routes/users.py
@router.get("/{inst_id}/users/{user_id}/achievements")
async def get_user_achievements_route(inst_id: str, user_id: str):
    return await achievements_service.get_user_achievements(user_id)


# achievement popup
@router.get("/{inst_id}/users/{user_id}/achievements/unlocked")
async def get_unlocked_achievements(inst_id: str, user_id: str):
    return await achievements_service.get_newly_unlocked_achievements(user_id)
