"""
This route is to retrieve news feed based on user's preferences.
For now, it will just route all news that is part of the institution.
"""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from app.services import news_service, comment_service
from app.core.config import settings
from app.core.db import supabase
from app.models.news_post import PostComment, PostCommentCreate, LikeToggleResponse
from app.core.auth import get_current_user

# from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/{inst_id}/news", tags=["news"], dependencies=[Depends(get_current_user)]
)


@router.get("/")
def test_route():
    print("News Feed Hello")
    return "News Feed Hello"


# Return an array of institution news
@router.get("/feed")
async def get_feed(
    inst_id: uuid.UUID, current_user: UserPayload = Depends(get_current_user)
):
    posts = await news_service.get_institution_news(
        supabase, inst_id, user_id=current_user.id
    )
    if posts is None:
        raise HTTPException(
            status_code=404, detail="No news found for this institution"
        )

    return posts


# Add this below your existing /feed route
@router.get("/feed/personalised")
async def get_personalised_feed(inst_id: str, user_id: str):
    # user_id comes as query param: /feed/personalised?user_id=abc123
    # inst_id comes from the URL prefix: /{inst_id}/news/feed/personalised

    posts = await news_service.get_personalised_news(supabase, inst_id, user_id)

    if posts is None:
        raise HTTPException(status_code=404, detail="Could not fetch personalised feed")
    return posts


@router.get("/{post_id}/comments")
async def get_post_comments(
    post_id: uuid.UUID, current_user: UserPayload = Depends(get_current_user)
):
    post_comments = await comment_service.get_post_comments(supabase, post_id)
    return post_comments


@router.post("/{post_id}/comments", response_model=PostComment)
async def create_comment(
    post_id: uuid.UUID,
    body: PostCommentCreate,
    current_user: UserPayload = Depends(get_current_user),
):

    try:
        insert_response = await comment_service.create_comment(
            supabase=supabase,
            post_id=post_id,
            commented_by_user_id=current_user.id,
            comment_text=body.comment_text,
            parent_comment_id=body.parent_comment_id,
        )

        return insert_response

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        # Logic errors or DB errors caught here
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while processing the comment.",
        )


# ----------------------------
# MY LIKES
# ----------------------------
@router.post("/{post_id}/likes", response_model=LikeToggleResponse)
async def toggle_post_like(
    post_id: uuid.UUID, current_user: UserPayload = Depends(get_current_user)
):
    try:
        user_id = current_user.id
        result = await news_service.toggle_post_like(post_id=post_id, user_id=user_id)
        return {
            "status": "success",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error while toggling likes: {e}")
