import uuid
from typing import Any, Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, File, Query
from pydantic import EmailStr, BaseModel
from openai import OpenAI
from app.services import users_service, news_service, communities_service
from app.core.db import supabase
from app.core.config import settings

router = APIRouter(prefix="/{inst_id}/users", tags=["users"])
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
    user_id: uuid.UUID


def moderate_text(text: str):
    # ingest
    # call api
    print("Moderting text...")
    response = client.moderations.create(
        model="omni-moderation-latest",
        input=text,
    )
    print(response.results)
    print("Checking for flag...")
    print(response.results[0].flagged)
    return response.results[0].flagged


@router.post("/create")
async def create_post(item: UserPublishPostBody):
    moderation = moderate_text(item.content)

    return {
        "content": item.content,
        "moderation": moderation,
    }


# Get a list a community user is a part of
@router.get("/me/communities")
async def get_user_communities(inst_id: str):
    # hard code this first
    user_id = "4813d507-9b97-4bb7-bee4-39ec47070889"
    user_communities = await users_service.get_user_communities(
        supabase, inst_id, user_id
    )

    if user_communities is None or len(user_communities) == 0:
        raise HTTPException(status_code=404, detail="No communities found")
    return user_communities


@router.get("/me/news")
async def get_my_news(user_id: str):
    my_news = await news_service.get_user_news(supabase, user_id)
    if my_news is None or len(my_news) == 0:
        raise HTTPException(status_code=404, detail="No news found")
    return my_news


@router.get("/{user_id}/news")
async def get_user_news(user_id: str):
    my_news = await news_service.get_user_news(supabase, user_id)
    if my_news is None or len(my_news) == 0:
        raise HTTPException(status_code=404, detail="No news found")
    return my_news


@router.post("/me/news")
async def create_post(
    inst_id: str,
    user_id: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    school: str = Form(...),
    communities: list[str] = Form(...),
    image: UploadFile = File(...),
):
    try:
        isSchool = True if school == "true" else False

        response = await news_service.create_post(
            supabase, inst_id, user_id, image, title, content, isSchool, communities
        )

        return {
            "status": "success",
            "message": "You have successfully published your news post.",
        }
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")


@router.post("/me/drafts")
async def save_draft(
    user_id: str = Form(...),
    title: str | None = Form(None),
    content: str | None = Form(None),
    image: UploadFile | None = File(None),
):
    try:
        response = await news_service.save_draft(
            supabase, user_id, image, title, content
        )

        return {
            "status": "success",
            "message": "Draft saved successfully",
            "data": response[0] if response else None,
        }

    except Exception as e:
        # Log the actual error for your own debugging
        print(f"Draft Save Error: {str(e)}")

        # Return a more descriptive error if possible
        raise HTTPException(
            status_code=500,
            detail="We couldn't save your draft right now. Please try again.",
        )


@router.get("/me/drafts")
async def get_user_drafts(user_id: str):
    user_drafts = await news_service.get_user_drafts(supabase, user_id)
    if user_drafts is None or len(user_drafts) == 0:
        raise HTTPException(status_code=404, detail="No drafts found")
    return user_drafts


@router.get("/{user_id}")
async def get_user_profile(inst_id: str, user_id: str):
    user_profile = await users_service.get_user_profile(supabase, inst_id, user_id)
    if user_profile is None or len(user_profile) == 0:
        raise HTTPException(status_code=404, detail="No profile details found")
    return user_profile


@router.delete("/me/communities/{community_id}")
async def leave_community(community_id: str):
    try:
        user_id = "4813d507-9b97-4bb7-bee4-39ec47070889"
        # Call the service layer to handle the DB logic
        result = await communities_service.leave_community(
            supabase, community_id, user_id
        )
        print(result)
        return {
            "status": "success",
            "message": "You have successfully left the community.",
            "data": result,
        }
    except Exception as e:
        print(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail="Could not leave community")


@router.get("/")
async def search_users(
    inst_id: str,
    name: Optional[str] = Query(None, min_length=1),  # Prevents empty string searches
):
    try:
        # If no name is provided, you might want to return all users
        # or an empty list depending on your UI needs.
        result = await users_service.find_users_by_name(supabase, inst_id, name)
        return result
    except Exception as e:
        print(f"Search Error: {e}")
        raise HTTPException(status_code=500, detail="Error searching users")


@router.post("/me/communities")
async def join_community(body: JoinCommunityRequest):
    try:
        result = await communities_service.join_community(
            supabase, str(body.community_id), str(body.user_id)
        )

        return {
            "status": "success",
            "message": "Welcome to the community!",
            "data": result,
        }
    except Exception as e:
        # Check if the error is a "Duplicate Key" (User already in community)
        if "duplicate key" in str(e).lower():
            raise HTTPException(status_code=400, detail="You are already a member.")

        raise HTTPException(status_code=500, detail="Failed to join community")
