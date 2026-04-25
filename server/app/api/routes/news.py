"""
This route is to retrieve news feed based on user's preferences.
For now, it will just route all news that is part of the institution.
"""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from app.services import news_service
from app.core.config import settings
from app.core.db import supabase
from app.dependencies.auth import get_current_user
from app.schemas.reports import CreatePostReportRequest, CreatePostReportResponse
from app.services import reports_service


router = APIRouter(prefix="/{inst_id}/news", tags=["news"])


@router.get("/")
def test_route():
    print("News Feed Hello")
    return "News Feed Hello"


# Return an array of institution news
@router.get("/feed")
async def get_feed(inst_id: str):
    # Add JWT Decode later

    # Use user_email in request body first

    # call DB
    posts = await news_service.get_institution_news(supabase, inst_id)
    if posts is None:
        raise HTTPException(
            status_code=404, detail="No news found for this institution"
        )

    return posts

@router.post("/{post_id}/report", response_model=CreatePostReportResponse)
async def report_post(
    inst_id: str,
    post_id: str,
    payload: CreatePostReportRequest,
    current_user=Depends(get_current_user),
):
    try:
        await reports_service.create_post_report(
            post_id=post_id,
            reported_by_user_id=current_user.id,
            reason=payload.reason,
            description=payload.description,
        )

        return {
            "status": "success",
            "message": "Report submitted successfully",
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        print(f"Report Post Error: {repr(e)}")
        raise HTTPException(status_code=500, detail="Failed to report post")