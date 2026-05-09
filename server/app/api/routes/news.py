"""
This route is to retrieve news feed based on user's preferences.
For now, it will just route all news that is part of the institution.
"""

from fastapi import APIRouter, Depends, HTTPException, status
import uuid
from app.services import news_service, comment_service, reports_service
from app.core.db import supabase
from app.core.auth import (
    get_current_user,
    get_current_app_user,
    get_current_inst_id,
    UserPayload,
)
from app.schemas.reports import CreatePostReportRequest, CreatePostReportResponse
from app.models.news_post import PostComment, PostCommentCreate, LikeToggleResponse

router = APIRouter(
    prefix="/{inst_id}/news",
    tags=["news"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/")
def test_route():
    print("News Feed Hello")
    return "News Feed Hello"


# Return an array of institution news
@router.get("/feed")
async def get_feed(
    inst_id: uuid.UUID, app_user: UserPayload = Depends(get_current_app_user)
):
    posts = await news_service.get_institution_news(
        supabase, str(inst_id), user_id=app_user["id"]
    )
    if posts is None:
        raise HTTPException(
            status_code=404,
            detail="No news found for this institution",
        )

    return posts


# Add this below your existing /feed route
@router.get("/feed/personalised")
async def get_personalised_feed(
    inst_id: str,
    limit: int = 20,
    offset: int = 0,
    current_user: UserPayload = Depends(get_current_app_user),
):
    # user_id comes as query param: /feed/personalised?user_id=abc123
    # inst_id comes from the URL prefix: /{inst_id}/news/feed/personalised

    posts = await news_service.get_personalised_news(
        supabase, inst_id, current_user["id"], limit=limit, offset=offset
    )

    if posts is None:
        raise HTTPException(status_code=404, detail="Could not fetch personalised feed")
    return posts


@router.get("/{news_id}/comments")
async def get_post_comments(
    news_id: uuid.UUID, current_user: UserPayload = Depends(get_current_app_user)
):
    post_comments = await comment_service.get_post_comments(supabase, news_id)
    return post_comments


@router.post("/{news_id}/comments", response_model=PostComment)
async def create_comment(
    news_id: uuid.UUID,
    body: PostCommentCreate,
    current_user: UserPayload = Depends(get_current_app_user),
):
    try:
        insert_response = await comment_service.create_comment(
            supabase=supabase,
            post_id=news_id,
            commented_by_user_id=current_user["id"],
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


# Categories
@router.get("/categories")
async def get_categories(inst_id: str):
    try:
        response = await news_service.get_categories(supabase=supabase, inst_id=inst_id)
        if response is None:
            raise HTTPException(status_code=404, detail="No categories found")
        return response
    except Exception as e:
        print(f"Fetch categories error: {repr(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch categories.")


@router.get("/{news_id}")
async def get_news_post_by_id(
    news_id: str, current_user: UserPayload = Depends(get_current_app_user)
):
    try:
        news_post = await news_service.get_news_post_by_id(
            supabase=supabase, news_id=news_id, user_id=current_user["id"]
        )
        if news_post is None:
            raise HTTPException(
                status_code=404,
                detail="News post cannot be found.",
            )

        return news_post
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while fetching the news post.",
        )


# ----------------------------
# MY LIKES
# ----------------------------
@router.post("/{news_id}/likes", response_model=LikeToggleResponse)
async def toggle_post_like(
    news_id: uuid.UUID, current_user: UserPayload = Depends(get_current_app_user)
):
    try:
        user_id = current_user["id"]
        result = await news_service.toggle_post_like(
            supabase=supabase, post_id=news_id, user_id=user_id
        )
        return {
            "status": "success",
            "data": result,
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error while toggling likes: {e}")


@router.post("/{news_id}/report", response_model=CreatePostReportResponse)
async def report_post(
    inst_id: str,
    news_id: str,
    payload: CreatePostReportRequest,
    app_user=Depends(get_current_app_user),
    current_user_inst_id: str = Depends(get_current_inst_id),
):
    try:
        if inst_id != current_user_inst_id:
            raise HTTPException(
                status_code=403,
                detail="You cannot report posts outside your institution",
            )

        await reports_service.create_post_report(
            post_id=news_id,
            reported_by_user_id=app_user["id"],
            reason=payload.reason,
            description=payload.description,
        )

        return {
            "status": "success",
            "message": "Report submitted successfully",
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Report Post Error: {repr(e)}")
        raise HTTPException(status_code=500, detail="Failed to report post")
