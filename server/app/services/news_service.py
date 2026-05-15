from supabase import Client
from typing import List, Optional
from app.models.news_post import (
    NewsPost,
    Draft,
    LikeToggleResponse,
    LikeToggleResponseData,
)
from app.models.category import Category
import uuid
from fastapi import File, UploadFile
from fastapi import HTTPException
from postgrest.exceptions import APIError
from datetime import datetime
from bs4 import BeautifulSoup
import urllib.parse


async def get_institution_news(
    supabase: Client, inst_id: str, user_id: str
) -> List[dict]:
    # Logic: Fetch all news where the tenant matches
    response = (
        supabase.table("news_posts")
        .select("""
            id,
            created_at,
            author,
            title, 
            description, 
            image_url,
            content,
            users!news_posts_author_fkey!inner(name, image_url),
            likes_count:post_likes(count),
            comments_count:post_comments(count),
            user_liked:post_likes(count).eq(user_id, {user_id}),
            user_saved:saved_post(count).eq(user_id, {user_id})
            """.format(user_id=f"'{user_id}'"))
        .eq("inst_id", inst_id)
        .eq("status", "PUBLISHED")  # <- show only published posts. no suspended posts
        .order("created_at", desc=True)
        .execute()
    )

    posts = []
    for post in response.data:
        # 2. Extract counts (Supabase returns them as a list: [{'count': 5}])
        likes = post.get("likes_count", [{}])[0].get("count", 0)
        comments = post.get("comments_count", [{}])[0].get("count", 0)

        # 3. Boolean check: if count > 0, the user has interacted with it
        has_liked = post.get("user_liked", [{}])[0].get("count", 0) > 0
        has_saved = post.get("user_saved", [{}])[0].get("count", 0) > 0

        posts.append(
            NewsPost(
                id=post["id"],
                created_at=post["created_at"],
                author_id=post["author"],
                author=post["users"]["name"],
                title=post["title"],
                description=post["description"] or "",
                image_url=post["image_url"] or "",
                content=post["content"] or "",
                likes_count=likes,
                comments_count=comments,
                has_liked=has_liked,
                has_saved=has_saved,
            )
        )

    return posts


async def get_community_news(
    supabase: Client, community_id: str, user_id: str
) -> List[NewsPost]:
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
            users!news_posts_author_fkey!inner(name, image_url),
            likes_count:post_likes(count),
            comments_count:post_comments(count),
            user_liked:post_likes(count).eq(user_id, {user_id}),
            user_saved:saved_post(count).eq(user_id, {user_id}),
            """.format(user_id=f"'{user_id}'"))
        .eq("community_id", community_id)
        .eq("status", "PUBLISHED")
        .order("created_at", desc=True)
        .execute()
    )
    posts = []
    for post in response.data:
        # 2. Extract counts (Supabase returns them as a list: [{'count': 5}])
        likes = post.get("likes_count", [{}])[0].get("count", 0)
        comments = post.get("comments_count", [{}])[0].get("count", 0)

        # 3. Boolean check: if count > 0, the user has interacted with it
        has_liked = post.get("user_liked", [{}])[0].get("count", 0) > 0
        has_saved = post.get("user_saved", [{}])[0].get("count", 0) > 0

        posts.append(
            NewsPost(
                id=post["id"],
                # created_at=created_at,
                created_at=post["created_at"],
                author_id=post["author"],
                author=post["users"]["name"],
                title=post["title"],
                description=post["description"] or "",
                image_url=post["image_url"] or "",
                content=post["content"] or "",
                likes_count=likes,
                comments_count=comments,
                has_liked=has_liked,
                has_saved=has_saved,
            )
        )

    return posts


async def create_post(
    supabase: Client,
    inst_id: str,
    user_id: str,
    title: str,
    description: str,
    content: str,
    category_id: str,
    destination: str,
    is_public: bool,
    community_id: Optional[str],
    draft_id: Optional[str],
    thumbnail: UploadFile | None,
    content_images: list[UploadFile],
    is_flagged: str,
) -> List[dict]:
    try:
        if draft_id:
            supabase.table("user_drafts").delete().eq("draft_id", draft_id).eq(
                "user_id", user_id
            ).execute()
        user_role = None
        is_request = False
        if destination == "COMMUNITY" and community_id:
            # Check user membership and role
            member_res = (
                supabase.table("community_members")
                .select("role")
                .eq("community_id", community_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )

            # If user isn't in the community at all, block it
            if not member_res.data:
                raise Exception("You are not a member of this community.")

            user_role = member_res.data.get("role")

            # RULE: Only admins can post to "Public + Community"
            if is_public and user_role != "admin":
                raise Exception("Only admins can post publicly to a community.")

        thumbnail_url = None
        if thumbnail and thumbnail.filename:
            try:
                # 1. Upload Thumbnail
                file_extension = thumbnail.filename.split(".")[-1]
                storage_path = f"news_images/{uuid.uuid4()}.{file_extension}"

                # 2. Read the binary content of the uploaded file
                file_content = await thumbnail.read()
                response = supabase.storage.from_("post_media").upload(
                    path=storage_path,
                    file=file_content,
                    file_options={"content-type": thumbnail.content_type},
                )

                # Get image url after inserting
                thumbnail_url = supabase.storage.from_("post_media").get_public_url(
                    storage_path
                )
            except Exception as e:
                print(f"Thumbnail upload failed, proceeding without one: {e}")

        # Upload Content Images and Replace URIs in HTML
        final_content_html = content

        if len(content_images) > 0:
            for img_file in content_images:
                # Read file
                img_ext = img_file.filename.split(".")[-1]
                img_path = f"news_body/{uuid.uuid4()}.{img_ext}"
                img_content = await img_file.read()

                # Upload to Supabase
                supabase.storage.from_("post_media").upload(
                    path=img_path,
                    file=img_content,
                    file_options={"content-type": img_file.content_type},
                )

                # Get the new public URL
                public_url = supabase.storage.from_("post_media").get_public_url(
                    img_path
                )

                final_content_html = final_content_html.replace(
                    img_file.filename, public_url
                )

        # If it's a community post by a regular member, it goes to requests
        is_request = (
            destination == "COMMUNITY" and community_id and user_role != "admin"
        )

        post_payload = {
            "inst_id": inst_id,
            "author": user_id,
            "image_url": thumbnail_url,
            "title": title,
            "description": description,
            "content": final_content_html,
            "status": is_flagged if not is_request else "PENDING_COMMUNITY",
            "category_id": category_id,
            "is_public": (
                is_public if not is_request else False
            ),  # Force false if request
            "community_id": (
                community_id if not is_request else None
            ),  # Only link if approved/admin
        }

        if is_request:
            # Create the post first (unlinked to community)
            news_res = supabase.table("news_posts").insert(post_payload).execute()
            news_post_id = news_res.data[0]["id"]

            # Create the request for the admin
            supabase.table("community_post_requests").insert(
                {
                    "request_id": news_post_id,
                    "institution_id": inst_id,
                    "community_id": community_id,
                    "requested_by_user_id": user_id,
                    "status": "pending",
                }
            ).execute()

            return {
                "status": "success",
                "message": "Post submitted to community admins for review.",
            }

        else:
            # Direct insert for Public, Followers, or Admin Community posts
            news_res = supabase.table("news_posts").insert(post_payload).execute()

            return {
                "status": "success",
                "message": "You have successfully published the news post.",
            }

    except Exception as e:
        raise e


async def update_news_post(
    supabase: Client,
    user_id: str,
    news_id: str,
    title: str,
    content: str,
    status: str,
    thumbnail: UploadFile = None,
    content_images: List[UploadFile] = [],
):
    # 1. Handle Thumbnail (only if a new one is uploaded)
    thumbnail_url = None
    if thumbnail and thumbnail.filename:
        try:
            file_extension = thumbnail.filename.split(".")[-1]
            storage_path = f"news_images/{uuid.uuid4()}.{file_extension}"
            file_content = await thumbnail.read()

            supabase.storage.from_("post_media").upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": thumbnail.content_type},
            )
            thumbnail_url = supabase.storage.from_("post_media").get_public_url(
                storage_path
            )
        except Exception as e:
            print(f"Thumbnail update failed: {e}")

    # 2. Handle Content Images & HTML Replacement
    final_content_html = content
    if content_images:
        for img_file in content_images:
            img_ext = img_file.filename.split(".")[-1]
            img_path = f"news_body/{uuid.uuid4()}.{img_ext}"
            img_content = await img_file.read()

            supabase.storage.from_("post_media").upload(
                path=img_path,
                file=img_content,
                file_options={"content-type": img_file.content_type},
            )
            public_url = supabase.storage.from_("post_media").get_public_url(img_path)
            # Replace the local filename/placeholder with the new Supabase URL
            final_content_html = final_content_html.replace(
                img_file.filename, public_url
            )

    # 3. Update DB
    update_data = {
        "title": title,
        "content": final_content_html,
        "status": status,
        "updated_at": datetime.utcnow().isoformat(),
    }

    # Only update thumbnail_url if a new one was successfully uploaded
    if thumbnail_url:
        update_data["image_url"] = thumbnail_url

    response = (
        supabase.table("news_posts")
        .update(update_data)
        .eq("author", user_id)
        .eq("id", news_id)
        .execute()
    )

    return response.data


async def save_draft(
    supabase: Client,
    user_id: str,
    draft_id: Optional[str] = None,
    thumbnail: UploadFile | None = None,
    title: str | None = None,
    content: str | None = None,
    content_images: Optional[list[UploadFile]] = None,
) -> List[dict]:
    try:
        draft_data = {"user_id": user_id, "updated_at": datetime.now().isoformat()}
        final_image_url = None

        # 1. Handle Image Upload if it exists
        if thumbnail is not None:
            file_extension = thumbnail.filename.split(".")[-1]
            storage_path = f"draft_images/{uuid.uuid4()}.{file_extension}"

            file_content = await thumbnail.read()

            # Perform upload
            supabase.storage.from_("post_media").upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": thumbnail.content_type},
            )

            # Get public URL
            final_image_url = supabase.storage.from_("post_media").get_public_url(
                storage_path
            )
            draft_data["thumbnail"] = final_image_url

        if title is not None:
            draft_data["title"] = title

        # Handle Content and Content Images
        if content is not None:
            final_content_html = content

            if content_images:
                for img_file in content_images:
                    img_ext = img_file.filename.split(".")[-1]
                    img_path = f"draft_images_body/{uuid.uuid4()}.{img_ext}"
                    img_content = await img_file.read()

                    supabase.storage.from_("post_media").upload(
                        path=img_path,
                        file=img_content,
                        file_options={"content-type": img_file.content_type},
                    )

                    public_url = supabase.storage.from_("post_media").get_public_url(
                        img_path
                    )
                    # Note: img_file.filename here matches the "placeholder" sent from frontend
                    final_content_html = final_content_html.replace(
                        img_file.filename, public_url
                    )
            draft_data["content"] = final_content_html
        # insert post
        if draft_id:
            res = (
                supabase.table("user_drafts")
                .update(draft_data)
                .eq("draft_id", draft_id)
                .eq("user_id", user_id)
                .execute()
            )
        else:
            res = supabase.table("user_drafts").insert(draft_data).execute()

        return res.data[0] if res.data else None

    except Exception as e:
        print(f"Error saving draft: {e}")
        raise e


async def get_user_news(supabase: Client, user_id: str) -> List[dict]:
    response = (
        supabase.table("news_posts")
        .select("""
            id,
            created_at,
            author,
            title, 
            description, 
            image_url,
            content,
            users!news_posts_author_fkey!inner(name, image_url),
            likes_count:post_likes(count),
            comments_count:post_comments(count),
            user_liked:post_likes(count).eq(user_id, {user_id}),
            user_saved:saved_post(count).eq(user_id, {user_id})
            """.format(user_id=f"'{user_id}'"))
        .eq("author", user_id)
        .eq("status", "PUBLISHED")  # <- show only published posts. no suspended posts
        .order("created_at", desc=True)
        .execute()
    )

    posts = []
    for post in response.data:
        # 2. Extract counts (Supabase returns them as a list: [{'count': 5}])
        likes = post.get("likes_count", [{}])[0].get("count", 0)
        comments = post.get("comments_count", [{}])[0].get("count", 0)

        # 3. Boolean check: if count > 0, the user has interacted with it
        has_liked = post.get("user_liked", [{}])[0].get("count", 0) > 0
        has_saved = post.get("user_saved", [{}])[0].get("count", 0) > 0

        posts.append(
            NewsPost(
                id=post["id"],
                created_at=post["created_at"],
                author_id=post["author"],
                author=post["users"]["name"],
                author_avatar_url=post["users"]["image_url"],
                title=post["title"],
                description=post["description"] or "",
                image_url=post["image_url"] or "",
                content=post["content"] or "",
                likes_count=likes,
                comments_count=comments,
                has_liked=has_liked,
                has_saved=has_saved,
            )
        )

    return posts


async def get_user_drafts(supabase: Client, user_id: str) -> List[dict]:
    response = (
        supabase.table("user_drafts")
        .select("*")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .order("created_at", desc=True)
        .execute()
    )

    return [Draft(**draft) for draft in response.data]


async def get_draft(supabase: Client, user_id: str, draft_id: str) -> Draft:
    response = (
        supabase.table("user_drafts")
        .select("*")
        .eq("user_id", user_id)
        .eq("draft_id", draft_id)
        .execute()
    )

    if response.data and len(response.data) > 0:
        draft = response.data[0]
        return Draft(**draft)
    return None


# helper function to extract src url from img tags
def extract_storage_paths(html_content: str, bucket_name: str):
    soup = BeautifulSoup(html_content, "html.parser")
    images = soup.find_all("img")

    paths = []
    for img in images:
        src = img.get("src")
        if src and bucket_name in src:
            # Extract the path after the bucket name
            # Format: .../object/public/bucket_name/path/to/file
            parts = src.split(f"{bucket_name}/")
            if len(parts) > 1:
                paths.append(parts[1])
    return paths


async def delete_user_draft(supabase: Client, user_id: str, draft_id: str):
    draft = (
        supabase.table("user_drafts")
        .select("content, thumbnail")
        .eq("draft_id", draft_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )

    if not draft.data:
        return False

    content = draft.data.get("content", "")
    bucket_name = "post_media"

    file_paths = extract_storage_paths(content, bucket_name)
    thumbnail = draft.data.get("thumbnail")

    if thumbnail:
        clean_thumb = thumbnail.split(f"{bucket_name}/")[-1]
        file_paths.append(clean_thumb)

    response = (
        supabase.table("user_drafts")
        .delete()
        .eq("draft_id", draft_id)
        .eq("user_id", user_id)
        .execute()
    )

    if file_paths:
        try:
            supabase.storage.from_(bucket_name).remove(file_paths)
        except Exception as e:
            print(f"Storage cleanup failed: {e}")

    return True


async def get_news_post_by_id(supabase: Client, news_id: str, user_id: str) -> NewsPost:
    response = (
        supabase.table("news_posts")
        .select("""
        id,
        created_at,
        author,
        title, 
        description, 
        image_url,
        content,
        users!news_posts_author_fkey!inner(name, image_url),
        likes_count:post_likes(count),
        comments_count:post_comments(count),
        user_saved:saved_post(count),
        user_liked:post_likes(count)
        """)
        .eq("id", news_id)
        .eq("user_liked.user_id", user_id)
        .eq("user_saved.user_id", user_id)
        .single()
        .execute()
    )
    if response.data is None:
        return None

    post = response.data
    # 2. Extract counts (Supabase returns them as a list: [{'count': 5}])
    likes = post.get("likes_count", [{}])[0].get("count", 0)
    comments = post.get("comments_count", [{}])[0].get("count", 0)

    # 3. Boolean check: if count > 0, the user has interacted with it
    has_liked = post.get("user_liked", [{}])[0].get("count", 0) > 0
    has_saved = post.get("user_saved", [{}])[0].get("count", 0) > 0

    return NewsPost(
        id=post["id"],
        created_at=post["created_at"],
        author_id=post["author"],
        author=post["users"]["name"],
        title=post["title"],
        description=post["description"] or "",
        image_url=post["image_url"] or "",
        content=post["content"] or "",
        likes_count=likes,
        comments_count=comments,
        has_liked=has_liked,
        has_saved=has_saved,
    )


async def get_personalised_news(
    supabase: Client, inst_id: str, user_id: str, limit: int, offset: int
) -> List[dict]:
    results = supabase.rpc(
        "get_user_feed",
        {
            "p_user_id": str(user_id),
            "p_inst_id": str(inst_id),
            "p_limit": limit,
            "p_offset": offset,
        },
    ).execute()

    if not results.data:
        return []

    return [NewsPost(**np) for np in results.data]


async def save_post(supabase: Client, user_id: str, post_id: str) -> dict:
    # Insert a new row into saved_post table
    response = (
        supabase.table("saved_post")
        .insert(
            {
                "user_id": user_id,
                "post_id": post_id,
            }
        )
        .execute()
    )
    return response.data


async def unsave_post(supabase: Client, user_id: str, post_id: str) -> dict:
    # Delete the row from saved_post table
    response = (
        supabase.table("saved_post")
        .delete()
        .eq("user_id", user_id)
        .eq("post_id", post_id)
        .execute()
    )
    return response.data


async def get_saved_posts(supabase: Client, user_id: str) -> List[dict]:
    query_columns = """
        post_id,
        news_posts!inner(
            id,
            created_at,
            author,
            title,
            description,
            image_url,
            content,
            status,
            users!news_posts_author_fkey!inner(name, image_url),
            likes_count:post_likes(count),
            comments_count:post_comments(count),
            user_liked:post_likes(count)
        )
    """

    response = (
        supabase.table("saved_post")
        .select(query_columns)
        .eq("user_id", user_id)
        .eq("news_posts.status", "PUBLISHED")
        # Filter the nested post_likes specifically for this user
        .eq("news_posts.post_likes.user_id", user_id)
        .order("saved_at", desc=True)
        .execute()
    )

    if not response.data:
        return []

    if not response.data:
        return []

    posts = []
    for row in response.data:
        p = row.get("news_posts")
        if not p:
            continue

        # Logic for boolean flags:
        # If the query returned any record in 'user_liked' for this user, it's True
        has_liked = len(p.get("user_liked", [])) > 0

        # Since we are fetching from 'saved_post' table for THIS user, it's always True
        has_saved = True

        posts.append(
            NewsPost(
                id=p["id"],
                created_at=p["created_at"],
                author_id=p["author"],
                author=p["users"]["name"] if p.get("users") else "Unknown",
                title=p["title"],
                description=p.get("description") or "",
                image_url=p.get("image_url") or "",
                content=p.get("content") or "",
                likes_count=p["likes_count"][0]["count"] if p.get("likes_count") else 0,
                comments_count=(
                    p["comments_count"][0]["count"] if p.get("comments_count") else 0
                ),
                has_liked=has_liked,
                has_saved=has_saved,
            )
        )

    return posts


async def is_post_saved(supabase: Client, user_id: str, post_id: str) -> bool:
    # Check if a specific post is already saved by this user
    response = (
        supabase.table("saved_post")
        .select("post_id")
        .eq("user_id", user_id)
        .eq("post_id", post_id)
        .limit(1)
        .execute()
    )
    # Returns True if a row exists, False if not
    return len(response.data) > 0


# ----------------------------
# MY LIKES
# ----------------------------
async def toggle_post_like(supabase: Client, post_id: uuid.UUID, user_id: str):
    try:

        response = supabase.rpc(
            "toggle_post_like", {"p_post_id": str(post_id), "p_user_id": user_id}
        ).execute()

        if not response.data:
            raise HTTPException(
                status_code=404, detail="Post not found or update failed"
            )

        return LikeToggleResponseData(**response.data[0])
    except APIError as e:
        # Log the error and raise a clean message
        raise HTTPException(status_code=400, detail=f"Database error: {e.message}")


async def get_categories(supabase: Client, inst_id: str):
    try:
        response = (
            supabase.table("categories")
            .select("*")
            .eq("inst_id", inst_id)
            .eq("status", "active")
            .execute()
        )

        if response.data is None:
            return None

        return [
            Category(
                category_id=category["category_id"],
                category_name=category["category_name"],
            )
            for category in response.data
        ]
    except Exception as e:
        # Log the error here
        raise HTTPException(status_code=500, detail="Database retrieval failed")
