from supabase import Client
from typing import List
from pydantic import EmailStr
import uuid
from app.models.admin import User, CreateUser
from app.core.db import supabase
from datetime import datetime, timezone



async def get_student_users(supabase: Client, inst_id: str) -> List[dict]:

    response = (
        supabase.table("users")
        .select(
            """
            id,
            inst_id,
            name,
            email,
            role,
            status,
            created_at,
            updated_at
        """
        )
        .eq("inst_id", inst_id)
        .eq("role", "student")
        .execute()
    )

    return [User(**user) for user in response.data]


async def get_staff_users(supabase: Client, inst_id: str) -> List[dict]:
    response = (
        supabase.table("users")
        .select(
            """
            id,
            inst_id,
            name,
            email,
            role,
            status,
            created_at,
            updated_at
        """
        )
        .eq("inst_id", inst_id)
        .eq("role", "staff")  # only staff
        .execute()
    )
    return [User(**user) for user in response.data]


async def get_admin_users(supabase: Client, inst_id: str) -> List[dict]:
    # Fetch institution and platform admins from users table
    response = (
        supabase.table("users")
        .select("id, inst_id, name, email, role, status, created_at, updated_at")
        .eq("inst_id", inst_id)
        .in_("role", ["institution_admin", "platform_admin"])
        .execute()
    )
    admins = [User(**user) for user in response.data]

    # Fetch community admins from community_admins table
    comm_admin_response = (
        supabase.table("community_admins")
        .select(
            """
            user_id,
            users!community_admins_user_id_fkey(
                id, inst_id, name, email, role, status, created_at, updated_at
            ),
            communities!community_admins_community_id_fkey(inst_id)
            """
        )
        .execute()
    )

    # Filter by inst_id and add community_admin role label
    for row in comm_admin_response.data:
        if (
            row.get("communities") and
            row["communities"].get("inst_id") == inst_id and
            row.get("users")
        ):
            user_data = row["users"]
            # Override role to show as community_admin
            user_data["role"] = "community_admin"
            admins.append(User(**user_data))

    return admins


async def create_new_user(
    supabase: Client,
    inst_id: uuid.UUID,
    new_user_name: str,
    new_user_email: EmailStr,
    password: str,
    role: str,
):
    print("i reached here")
    auth_response = supabase.auth.admin.create_user(
        {
            "email": new_user_email,
            "password": password,
            "user_metadata": {"name": new_user_name},
            "email_confirm": True,
        }
    )

    if not auth_response.user:
        return None

    account_type = "basic_user" if role in ["student", "staff"] else role
    new_user_uuid = auth_response.user.id
    db_response = (
        supabase.table("users")
        .insert(
            {
                "id": new_user_uuid,
                "inst_id": inst_id,
                "name": new_user_name,
                "email": new_user_email,
                "role": role,
                "account_type": account_type,
            }
        )
        .execute()
    )
    return db_response.data

async def ban_user(supabase: Client, user_id: str) -> dict:
    # Set status to "banned" — user cannot login anymore
    response = (
        supabase.table("users")
        .update({"status": "banned"})
        .eq("id", user_id)
        .execute()
    )
    return response.data

async def lift_ban(supabase: Client, user_id: str) -> dict:
    # Set status back to "active" — user can login again
    response = (
        supabase.table("users")
        .update({"status": "active"})
        .eq("id", user_id)
        .execute()
    )
    return response.data

async def suspend_user(supabase: Client, user_id: str) -> dict:
    # Set status to "suspended" — user cannot login
    response = (
        supabase.table("users")
        .update({"status": "suspended"})
        .eq("id", user_id)
        .execute()
    )
    return response.data

async def update_user(
    supabase: Client,
    user_id: str,
    name: str,
    email: str,
    role: str,
) -> dict:
    # Update user details in the users table
    response = (
        supabase.table("users")
        .update({
            "name": name,
            "email": email,
            "role": role,
        })
        .eq("id", user_id)
        .execute()
    )
    return response.data

async def get_flagged_posts(supabase: Client, inst_id: str) -> List[dict]:
    # Fetch all posts with FLAGGED status for this institution
    response = (
        supabase.table("news_posts")
        .select(
            """
            id,
            title,
            description,
            content,
            image_url,
            status,
            created_at,
            users!news_posts_author_fkey!inner(name)
            """
        )
        .eq("inst_id", inst_id)
        .eq("status", "FLAGGED")   # only flagged posts
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


async def approve_post(supabase: Client, post_id: str) -> dict:
    # Change status to PUBLISHED
    response = (
        supabase.table("news_posts")
        .update({"status": "PUBLISHED"})
        .eq("id", post_id)
        .execute()
    )
    return response.data


async def reject_post(supabase: Client, post_id: str) -> dict:
    # Change status to REJECTED
    response = (
        supabase.table("news_posts")
        .update({"status": "REJECTED"})
        .eq("id", post_id)
        .execute()
    )
    return response.data

async def get_published_posts(supabase: Client, inst_id: str) -> List[dict]:
    # Fetch all published posts for this institution for admin review
    response = (
        supabase.table("news_posts")
        .select(
            """
            id,
            title,
            description,
            image_url,
            status,
            created_at,
            author,
            users!news_posts_author_fkey!inner(name, email)
            """
        )
        .eq("inst_id", inst_id)
        .eq("status", "PUBLISHED")
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


async def flag_post(
    supabase: Client,
    post_id: str,
    reason: str,
    admin_id: str,
    inst_id: str,
) -> dict:
    # Step 1: Get the post author so we can notify them
    post_response = (
        supabase.table("news_posts")
        .select("author, title")
        .eq("id", post_id)
        .single()
        .execute()
    )

    if not post_response.data:
        return None

    author_id = post_response.data["author"]
    post_title = post_response.data["title"]

    # Step 2: Update post status to FLAGGED
    supabase.table("news_posts").update(
        {"status": "FLAGGED"}
    ).eq("id", post_id).execute()

    # Step 3: Send notification to the post author with the reason
    supabase.table("notifications").insert({
        "actor_user_id": admin_id,          # the admin who flagged
        "notification_type": "POST_FLAGGED",
        "reference_id": post_id,
        "reference_table": "news_posts",
        # Include reason in the message so author knows why
        "message": f"Your post '{post_title}' has been flagged for review. Reason: {reason}",
        "is_read": False,
        "recipient_user_id": author_id,    # notify the post author
    }).execute()

    return {"status": "flagged"}


async def lift_suspension(supabase: Client, user_id: str) -> dict:
    # Set status back to "active" — user can login again
    response = (
        supabase.table("users")
        .update({"status": "active"})
        .eq("id", user_id)
        .execute()
    )
    return response.data

async def get_reported_posts(supabase: Client, inst_id: str) -> List[dict]:
    # Fetch all pending reports for posts in this institution
    response = (
        supabase.table("post_reports")
        .select(
            """
            report_id,
            reason,
            description,
            status,
            created_at,
            post_id,
            news_posts!inner(
                id,
                title,
                description,
                image_url,
                inst_id,
                users!news_posts_author_fkey!inner(name, email)
            ),
            users!post_reports_reported_by_user_id_fkey!inner(name, email)
            """
        )
        .eq("news_posts.inst_id", inst_id)   # only this institution's posts
        .eq("status", "pending")              # only pending reports
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


async def dismiss_report(
    supabase: Client,
    report_id: str,
    reason: str,
    admin_id: str,
) -> dict:
    print(f"Dismissing report: {report_id}, reason: {reason}, admin: {admin_id}")
    try:
        response = (
            supabase.table("post_reports")
            .update({
                "status": "dismissed",
                "description": reason,
                "reviewed_by_user_id": admin_id,
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
            })
            .eq("report_id", report_id)
            .execute()
        )
        print(f"Dismiss response: {response.data}")
        return response.data
    except Exception as e:
        print(f"EXACT ERROR: {e}")  # ← this will show the real error
        raise


async def flag_reported_post(
    supabase: Client,
    report_id: str,
    post_id: str,
    reason: str,
    admin_id: str,
) -> dict:
    print(f"Flagging report: {report_id}, post: {post_id}, reason: {reason}, admin: {admin_id}")
    try:
        # Step 1: Get post details to notify author
        post_response = (
            supabase.table("news_posts")
            .select("author, title")
            .eq("id", post_id)
            .single()
            .execute()
        )

        if not post_response.data:
            return None

        author_id = post_response.data["author"]
        post_title = post_response.data["title"]

        # Step 2: Update report status to flagged
        supabase.table("post_reports").update({
            "status": "flagged",
            "description": reason,
            "reviewed_by_user_id": admin_id,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("report_id", report_id).execute()

        # Step 3: Flag the actual post
        supabase.table("news_posts").update({
            "status": "FLAGGED"
        }).eq("id", post_id).execute()

        # Step 4: Notify the post author
        supabase.table("notifications").insert({
            "actor_user_id": admin_id,
            "notification_type": "POST_FLAGGED",
            "reference_id": post_id,
            "reference_table": "news_posts",
            "message": f"Your post '{post_title}' has been flagged after a report. Reason: {reason}",
            "is_read": False,
            "recipient_user_id": author_id,
        }).execute()

        return {"status": "flagged"}
    except Exception as e:
        print(f"EXACT ERROR: {e}")  # ← shows the real error
        raise
