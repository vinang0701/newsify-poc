"""
Place this file at: server/app/services/search_service.py
"""

from supabase import Client
from typing import List
from app.models.news_post import NewsPost


async def search_posts(supabase: Client, inst_id: str, query: str) -> List[dict]:
    if not query or len(query.strip()) < 2:
        return []

    response = (
        supabase.table("news_posts")
        .select("""
            id,
            author,
            title,
            description,
            image_url,
            content,
            created_at,
            users!news_posts_author_fkey!inner(name, image_url)
            """)
        .eq("inst_id", inst_id)
        .eq("status", "PUBLISHED")
        .ilike("title", f"%{query}%")  # case-insensitive search on title
        .order("created_at", desc=True)
        .execute()
    )

    if not response.data:
        return []

    return [
        NewsPost(
            id=post["id"],
            author_id=post["author"],
            author=post["users"]["name"],
            title=post["title"],
            description=post["description"] or "",
            image_url=post["image_url"] or "",
            content=post["content"] or "",
            created_at=post["created_at"] or "",
        )
        for post in response.data
    ]


async def search_users(supabase: Client, inst_id: str, query: str) -> List[dict]:
    if not query or len(query.strip()) < 2:
        return []

    response = (
        supabase.table("users")
        .select("id, name, image_url")
        .eq("inst_id", inst_id)
        .ilike("name", f"%{query}%")
        .order("name", desc=False)
        .limit(30)
        .execute()
    )

    return response.data or []
