"""
Place this file at: server/app/api/routes/search.py
Then register it in server/app/api/main.py:
    from app.api.routes import search
    api_router.include_router(search.router)
"""

from fastapi import APIRouter, HTTPException
from app.core.db import supabase
from app.services import search_service

router = APIRouter(prefix="/{inst_id}/search", tags=["search"])


# ---------------------------------------------------------------------------
# GET /{inst_id}/search/posts?q=keyword  — search posts by title
# ---------------------------------------------------------------------------

@router.get("/posts")
async def search_posts(inst_id: str, q: str = ""):
    try:
        results = await search_service.search_posts(supabase, inst_id, q)
        return results
    except Exception as e:
        print(f"Error searching posts: {e}")
        raise HTTPException(status_code=500, detail="Could not search posts")


# ---------------------------------------------------------------------------
# GET /{inst_id}/search/users?q=keyword  — search users by name
# ---------------------------------------------------------------------------

@router.get("/users")
async def search_users(inst_id: str, q: str = ""):
    try:
        results = await search_service.search_users(supabase, inst_id, q)
        return results
    except Exception as e:
        print(f"Error searching users: {e}")
        raise HTTPException(status_code=500, detail="Could not search users")