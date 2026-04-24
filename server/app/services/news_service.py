from supabase import Client
from typing import List
from app.models.news_post import NewsPost, Draft
from app.core.db import supabase
import uuid
from fastapi import File, UploadFile


async def get_institution_news(supabase: Client, inst_id: str) -> List[dict]:
    # Logic: Fetch all news where the tenant matches
    response = (
        supabase.table("news_posts")
        .select(
            """
            id,
            author,
            title, 
            description, 
            image_url,
            content,
            users!news_posts_author_fkey!inner(name, image_url)
        """
        )
        .eq("inst_id", inst_id)
        .eq("status", "PUBLISHED") #<- show only published posts. no suspended posts
        .order("created_at", desc=True)
        .execute()
    )

    # Map the list of dicts to a list of NewsPost objects
    return [
        NewsPost(
            id=post["id"],
            author_id=post["author"],
            author=post["users"]["name"],  # Map snake_case to camelCase
            title=post["title"],
            description=post["description"] or "",
            image_url=post["image_url"] or "",
            content=post["content"]
            or {},  # Pydantic handles JSONB to Dict[str, Any] automatically
        )
        for post in response.data
    ]


# Check where has this been posted to
async def get_community_news(supabase: Client, community_id: str) -> List[dict]:
    # response = (
    #     supabase.table("news_posts")
    #     .select(
    #         """
    #         id,
    #         title,
    #         description,
    #         image_url,
    #         content,
    #         users!news_posts_author_fkey!inner(name, image_url)
    #     """
    #     )
    #     .eq("community_id", community_id)
    #     .order("created_at", desc=True)
    #     .execute()
    # )
    response = (
        supabase.table("community_posts")
        .select(
            """
                community_id,
                news_posts!inner(id, title,
                description,
                image_url,
                content,
                author:users!news_posts_author_fkey(
                    id,
                    name, 
                    image_url
                )
            )
        """
        )
        .eq("community_id", community_id)
        .eq("status", "PUBLISHED") #<- show only published posts. no suspended posts
        .order("created_at", desc=True)
        .execute()
    )

    return [
        NewsPost(
            id=post["news_posts"]["id"],
            author_id=post["news_posts"]["author"]["id"],
            author=post["news_posts"]["author"]["name"],  # Map snake_case to camelCase
            title=post["news_posts"]["title"],
            description=post["news_posts"]["description"] or "",
            image_url=post["news_posts"]["image_url"] or "",
            content=post["news_posts"]["content"]
            or {},  # Pydantic handles JSONB to Dict[str, Any] automatically
        )
        for post in response.data
    ]


async def create_post(
    supabase: Client,
    inst_id: str,
    user_id: str,
    image: File,
    title: str,
    content: str,
    school: str,
    communities: List[str],
    category_id: str | None = None,
) -> List[dict]:
    try:

        # upload image first
        file_extension = image.filename.split(".")[-1]
        storage_path = f"news_images/{uuid.uuid4()}.{file_extension}"

        # 2. Read the binary content of the uploaded file
        file_content = await image.read()
        response = supabase.storage.from_("post_media").upload(
            path=storage_path,
            file=file_content,
            file_options={"content-type": image.content_type},
        )

        # Get image url after inserting
        storage_res = supabase.storage.from_("post_media").get_public_url(storage_path)

        """"""
        # insert post
        news_res = (
            supabase.table("news_posts")
            .insert(
                {
                    "inst_id": inst_id,
                    "author": user_id,
                    "image_url": storage_res,
                    "title": title,
                    "description": content[:100],
                    "content": {"text": content},
                    "status": "PUBLISHED",
                    "category_id": category_id,
                }
            )
            .execute()
        )

        # Insert to community_post
        new_post_id = news_res.data[0]["id"]

        # 2. Insert to community_post using the extracted ID
        all_results = []
        for comm in communities:
            comm_post_res = (
                supabase.table("community_posts")
                .insert({"community_id": comm, "post_id": new_post_id})
                .execute()
            )
            all_results.append(comm_post_res.data[0])

        return all_results
    except Exception as e:
        raise e


async def save_draft(
    supabase: Client,
    user_id: str,
    image: UploadFile | None = None,
    title: str | None = None,
    content: str | None = None,
) -> List[dict]:
    try:
        final_image_url = None  # Default to None for DB

        # 1. Handle Image Upload if it exists
        if image is not None:
            file_extension = image.filename.split(".")[-1]
            storage_path = f"draft_images/{uuid.uuid4()}.{file_extension}"

            file_content = await image.read()

            # Perform upload
            supabase.storage.from_("post_media").upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": image.content_type},
            )

            # Get public URL
            final_image_url = supabase.storage.from_("post_media").get_public_url(
                storage_path
            )

        """"""
        # insert post
        news_res = (
            supabase.table("user_drafts")
            .insert(
                {
                    "user_id": user_id,
                    "image_url": final_image_url,
                    "title": title,
                    "content": {"text": content} if content else None,
                }
            )
            .execute()
        )

        return news_res.data

    except Exception as e:
        print(f"Draft Save Error: {e}")
        raise e


async def get_user_news(supabase: Client, user_id: str) -> List[dict]:
    response = (
        supabase.table("news_posts")
        .select(
            """
            id,
            author,
            title, 
            description, 
            image_url,
            content,
            users!news_posts_author_fkey!inner(name, image_url)
        """
        )
        .eq("author", user_id)
        .eq("status", "PUBLISHED") #<- show only published posts. no suspended posts
        .order("created_at", desc=True)
        .execute()
    )

    if len(response.data) != 0:
        return [
            NewsPost(
                id=post["id"],
                author_id=post["author"],
                author=post["users"]["name"],  # Map snake_case to camelCase
                title=post["title"],
                description=post["description"] or "",
                image_url=post["image_url"] or "",
                content=post["content"]
                or {},  # Pydantic handles JSONB to Dict[str, Any] automatically
            )
            for post in response.data
        ]
    return []


async def get_user_drafts(supabase: Client, user_id: str) -> List[dict]:
    response = (
        supabase.table("user_drafts")
        .select(
            """
            draft_id,
            title, 
            image_url,
            content
        """
        )
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )

    if len(response.data) != 0:
        return [
            Draft(
                draft_id=draft["draft_id"],
                title=draft["title"],
                image_url=draft["image_url"],
                content=draft["content"],
            )
            for draft in response.data
        ]
    return []

async def get_personalised_news(supabase: Client, inst_id: str, user_id: str) -> List[dict]:

    # Step 1: Get this user's preferred category_ids from user_preferences table
    prefs_response = (
        supabase.table("user_preferences")
        .select("category_id")
        .eq("user_id", user_id)
        .execute()
    )
    
    # Turn the list of dicts into a flat list of ids
    # e.g. [{"category_id": "abc"}] → ["abc"]
    preferred_ids = [row["category_id"] for row in prefs_response.data]

    # If user has no preferences, return the normal feed so screen isnt empty
    if not preferred_ids:
        return await get_institution_news(supabase, inst_id)

    # Step 2: Fetch posts where category_id matches user's preferences
    # category_id is now directly on news_posts so no joining needed!
    response = (
        supabase.table("news_posts")
        .select(
            """
            id,
            author,
            title,
            description,
            image_url,
            content,
            users!news_posts_author_fkey!inner(name, image_url)
            """
        )
        .eq("inst_id", inst_id)                  # only this institution
        .in_("category_id", preferred_ids)        # only matching categories
        .eq("status", "PUBLISHED") #<- show only published posts. no suspended posts
        .order("created_at", desc=True)           # newest first
        .execute()
    )

    # Return empty list if no matching posts found
    if not response.data:
        return []

    # Map to NewsPost objects — same pattern as get_institution_news
    return [
        NewsPost(
            id=post["id"],
            author_id=post["author"],
            author=post["users"]["name"],
            title=post["title"],
            description=post["description"] or "",
            image_url=post["image_url"] or "",
            content=post["content"] or {},
        )
        for post in response.data
    ]