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
