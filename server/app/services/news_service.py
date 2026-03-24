from supabase import Client
from typing import List
from app.models.news_post import NewsPost
from app.core.db import supabase


async def get_institution_news(supabase: Client, inst_id: str) -> List[dict]:
    # Logic: Fetch all news where the tenant matches
    response = (
        supabase.table("news_posts")
        .select(
            """
            id,
            title, 
            description, 
            image_url,
            content,
            users!news_posts_author_fkey!inner(name, image_url)
        """
        )
        .eq("inst_id", inst_id)
        .order("created_at", desc=True)
        .execute()
    )

    # Map the list of dicts to a list of NewsPost objects
    return [
        NewsPost(
            id=post["id"],
            author=post["users"]["name"],  # Map snake_case to camelCase
            title=post["title"],
            description=post["description"] or "",
            image_url=post["image_url"] or "",
            content=post["content"]
            or {},  # Pydantic handles JSONB to Dict[str, Any] automatically
        )
        for post in response.data
    ]
