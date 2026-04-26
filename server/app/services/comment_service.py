from supabase import Client
from typing import List
from app.models.news_post import PostComment
from app.core.db import supabase
import uuid
from fastapi import HTTPException, status
from postgrest.exceptions import APIError


async def get_post_comments(supabase: Client, post_id: str):
    try:
        results = (
            supabase.table("post_comments")
            .select("*, commented_by:commented_by_user_id(name)")
            .eq("post_id", post_id)
            .order("created_at", desc=True)
            .execute()
        )

        comments = []
        for comment in results.data:
            commented_by = comment.get("commented_by") or {}
            comment["commented_by_user_name"] = commented_by.get("name", "UNKNOWN")
            comments.append(PostComment(**comment))

        return comments
    except APIError as e:
        # Handle Supabase-specific errors (e.g., connection, RLS violations)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {e.message}",
        )
    except Exception as e:
        # Generic catch-all
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch comments: {str(e)}",
        )


async def create_comment(
    supabase: Client,
    post_id: uuid.UUID,
    commented_by_user_id: str,
    comment_text: str,
    parent_comment_id: Optional[uuid.UUID] = None,
):
    print("trying")
    try:

        payload = {
            "post_id": str(post_id),
            "commented_by_user_id": commented_by_user_id,
            "comment_text": comment_text,
            "parent_comment_id": str(parent_comment_id) if parent_comment_id else None,
        }
        insert_result = supabase.table("post_comments").insert(payload).execute()
        if not insert_result.data[0]:
            raise ValueError("No data returned from database insert")
        return PostComment(**insert_result.data[0])

    except APIError as e:
        # Log the error here if you have a logger
        raise Exception(f"Database integrity error: {e.message}")
