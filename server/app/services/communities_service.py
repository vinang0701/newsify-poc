from supabase import Client
from typing import List, Optional
from app.models.community import (
    Community,
    CommunityMembership,
    CommunityMember,
    CommunityApplication,
    CommunityPostRequest,
    InvitedUser,
)
from app.core.db import supabase
import uuid
from datetime import datetime
from fastapi import UploadFile


async def get_communities(
    supabase: Client, inst_id: str, user_id: str, search: Optional[str] = None
) -> List[Community]:
    query = (
        supabase.table("communities")
        .select(
            "*, member_info:community_members(role, user_id, status), member_count:community_members(count)"
        )
        .eq("inst_id", inst_id)
        .eq("member_info.user_id", user_id)
        .eq("status", "active")
        .eq("member_count.status", "active")
        .order("name", desc=False)
    )
    if search:
        query = query.ilike("name", f"%{search}%")

    response = query.execute()

    formatted_communities = []
    for comm in response.data:
        # Check current user's membership info
        user_info_list = comm.get("member_info", [])
        user_membership = user_info_list[0] if user_info_list else None

        # Extract the count from the count alias
        # Supabase returns this as a list containing a dict with 'count'
        count_data = comm.get("member_count", [])
        total_count = count_data[0].get("count", 0) if count_data else 0

        # Map back to Pydantic-friendly keys
        comm["role"] = user_membership.get("role") if user_membership else None
        comm["isMember"] = user_membership is not None
        comm["member_count"] = total_count

        comm["member_status"] = (
            user_membership.get("status") if user_membership else None
        )

        formatted_communities.append(Community(**comm))

    return formatted_communities


async def get_community(
    supabase: Client, community_id: str, inst_id: str, user_id: str
):
    response = (
        supabase.table("communities")
        .select(
            "*, member_info:community_members(role, user_id, status), member_count:community_members(count)"
        )
        .eq("inst_id", inst_id)
        .eq("id", community_id)
        .eq("member_info.user_id", user_id)
        .eq("status", "active")
        .eq("member_count.status", "active")
        .order("name", desc=False)
        .single()
        .execute()
    )

    if response.data is None:
        return None

    comm = response.data
    user_info_list = comm.get("member_info", [])
    user_membership = user_info_list[0] if user_info_list else None

    count_data = comm.get("member_count", [])
    total_count = count_data[0].get("count", 0) if count_data else 0

    comm["role"] = user_membership.get("role") if user_membership else None
    comm["isMember"] = user_membership is not None
    comm["member_count"] = total_count

    comm["member_status"] = user_membership.get("status") if user_membership else None

    return Community(**comm)

    # response = (
    #     supabase.table("communities").select("*").eq("id", community_id).execute()
    # )

    # if response.data:
    #     return Community(**response.data[0])
    # return None


# Function to insert new community application into communities_requests
# Need to insert new record into community_memberships too
# For now, insert in both communities_requests table and communities table
async def create_community_application(
    supabase: Client,
    requested_by_user_id: str,
    inst_id: str,
    name: str,
    description: str,
    image: UploadFile | None,
    public: bool,
):
    community_image_url = None
    if image and image.filename:
        try:
            # 1. Generate a clean filename
            # We use a UUID to prevent collisions if two people upload "MyCommunity.png"
            file_extension = image.filename.split(".")[-1]
            clean_name = "".join(e for e in name if e.isalnum())
            file_path = (
                f"community_images/{clean_name}_{uuid.uuid4().hex}.{file_extension}"
            )

            # 2. Upload to Supabase Storage
            file_content = await image.read()
            storage_res = supabase.storage.from_("community_media").upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": image.content_type},
            )

            # 3. Get the Public URL
            community_image_url = supabase.storage.from_(
                "community_media"
            ).get_public_url(file_path)
        except Exception as e:
            print(f"Storage Upload Error: {e}")
            return None, "Failed to upload image"

    req_res = (
        supabase.table("community_creation_requests")
        .insert(
            {
                "requested_by_user_id": requested_by_user_id,
                "community_name": name,
                "description": description,
                "institution_id": inst_id,
                "status": "pending",
                "public": public,
                "image_url": community_image_url,
            }
        )
        .execute()
    )

    # add error handling
    if req_res.data is None:
        return None, req_res.error
    return req_res.data, None


async def get_community_role(supabase, community_id: str, user_id: str):
    res = (
        supabase.table("community_members")
        .select("role")
        .eq("user_id", user_id)
        .eq("community_id", community_id)
        .execute()
    )

    if res.data:
        return res.data[0]["role"]

    return None


async def leave_community(supabase: Client, community_id: str, user_id: str):
    response = (
        supabase.table("community_members")
        .delete()
        .eq("user_id", uuid.UUID(user_id))
        .eq("community_id", uuid.UUID(community_id))
        .execute()
    )
    return response.data


async def join_community(supabase: Client, community_id: str, user_id: str):
    comm_res = (
        supabase.table("communities")
        .select("public")
        .eq("id", community_id)
        .single()
        .execute()
    )

    if not comm_res.data:
        return None
    public = comm_res.data["public"]

    response = (
        supabase.table("community_members")
        .insert(
            {
                "community_id": community_id,
                "user_id": user_id,
                "joined_at": datetime.utcnow().isoformat(),
                "role": "member",
                "status": "active" if public is True else "pending",
            }
        )
        .execute()
    )
    if not response.data:
        return None

    return response.data


async def get_members_by_community(supabase: Client, community_id: str):
    # This syntax tells Supabase:
    # 1. Look at community_members
    # 2. Grab the related 'users' record for each row
    # 3. Only give me specific user fields
    response = (
        supabase.table("community_members")
        .select("role, users(id, name), status")
        .eq("community_id", community_id)
        .execute()
    )

    # Supabase returns nested objects, so we flatten them for easier UI use
    members = [
        CommunityMember(
            community_id=community_id,
            user_id=member["users"]["id"],
            name=member["users"]["name"],
            role=member.get("role", "member"),  # Fallback to 'member' if NULL
            status=member["status"],
        )
        for member in response.data
        if member.get("users")
    ]

    return members


async def get_invited_members(supabase: Client, community_id: str):
    response = (
        supabase.table("community_invitations")
        .select("*, users!invited_user_id(name, image_url)")
        .eq("community_id", community_id)
        .execute()
    )

    if response.data is None:
        return None

    invited_members = []
    for inv in response.data:
        user_data = inv.pop("users", {}) or {}
        inv["invited_user_name"] = user_data.get("name", "Unknown")
        inv["invited_user_image_url"] = user_data.get("image_url", "")

        invited_members.append(InvitedUser(**inv))

    return invited_members


async def remove_community_invite(
    supabase: Client, community_id: str, invited_user_id: str
):
    response = (
        supabase.table("community_invitations")
        .delete()
        .eq("community_id", community_id)
        .eq("invited_user_id", invited_user_id)
        .execute()
    )

    return response.data


async def update_membership_status(
    supabase: Client,
    community_id: str,
    user_id: str,
    new_status: str,
    admin_user_id: str,
):
    """
    Updates the status of a community member (e.g., from 'pending' to 'active').
    """
    response = (
        supabase.table("community_members")
        .update({"status": new_status})
        .eq("community_id", community_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        return None

    # 2. Get the community name for the notification message
    community_res = (
        supabase.table("communities")
        .select("name")
        .eq("id", community_id)
        .single()
        .execute()
    )

    community_name = (
        community_res.data.get("name", "a community")
        if community_res.data
        else "a community"
    )
    verb = "accepted" if new_status == "active" else "rejected"

    # 3. Create the notification record
    notification_data = {
        "recipient_user_id": user_id,
        "actor_user_id": admin_user_id,
        "notification_type": "COMMUNITY_STATUS_CHANGE",
        "reference_id": community_id,
        "reference_table": "communities",
        "message": f"Your request to join {community_name} has been {verb}.",
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
    }

    supabase.table("notifications").insert(notification_data).execute()

    return response.data


async def get_community_post_requests(
    supabase, community_id: str
) -> list[CommunityPostRequest]:
    response = (
        supabase.table("community_post_requests")
        .select("""
            request_id,
            status,
            reviewed_at,
            rejection_reason,
            news_posts(id, title, created_at, description, image_url),
            author_name:requested_by_user_id(name),
            reviewed_by:reviewed_by_user_id(name)
            """)
        .eq("community_id", community_id)
        .order("news_posts(created_at)", desc=True)
        .execute()
    )

    result = []

    for row in response.data or []:
        author_name = row.get("author_name", {}).get("name", "")
        reviewed_by = (
            row.get("reviewed_by", {}).get("name", "")
            if row.get("reviewed_by")
            else "NULL"
        )
        image_url = row.get("news_posts", {}).get("image_url", "")
        title = row.get("news_posts", {}).get("title", "Untitled")
        description = row.get("news_posts", {}).get("description", "")
        created_at = datetime.fromisoformat(
            row.get("news_posts", {}).get("created_at", "")
        )
        formatted_created_at = created_at.strftime("%d/%m/%Y")
        reviewed_at = (
            datetime.fromisoformat(row["reviewed_at"])
            if row.get("reviewed_at")
            else None
        )
        formatted_reviewed_at = (
            reviewed_at.strftime("%d/%m/%Y") if reviewed_at else None
        )

        result.append(
            CommunityPostRequest(
                request_id=row["request_id"],
                author_name=author_name,
                image_url=image_url,
                title=title,
                description=description,
                status=row["status"],
                created_at=formatted_created_at,
                reviewed_at=formatted_reviewed_at,
                reviewed_by=reviewed_by,
                rejection_reason=row.get("rejection_reason"),
            )
        )

    return result


async def update_community_post_request(
    supabase: Client,
    request_id: str,
    status: str,
    reviewed_by_user_id: str,
    rejection_reason: str,
):
    reviewed_at = datetime.utcnow().isoformat()  # current time

    update_data = {
        "status": status,
        "reviewed_at": reviewed_at,
        "reviewed_by_user_id": reviewed_by_user_id,
        "rejection_reason": rejection_reason if status == "rejected" else "",
    }

    response = (
        supabase.table("community_post_requests")
        .update(update_data)
        .eq("request_id", request_id)
        .execute()
    )

    if not response.data:
        return None, "Failed to update community post request."

    request_info = response.data[0]
    community_id = request_info.get("community_id")
    user_id = request_info.get("requested_by_user_id")

    if status == "approved":
        update_news_post = (
            supabase.table("news_posts")
            .update({"community_id": community_id, "status": "PUBLISHED"})
            .eq("id", request_id)
            .execute()
        )

    notification_data = {
        "recipient_user_id": user_id,
        "actor_user_id": reviewed_by_user_id,
        "notification_type": "COMMUNITY_POST_REQUEST_UPDATE",
        "reference_id": request_id,
        "reference_table": "news_posts",
        "message": f"Your post request was {status}.",
        "is_read": False,
        "created_at": reviewed_at,
    }

    supabase.table("notifications").insert(notification_data).execute()

    return response.data, None


async def post_to_community(
    supabase: Client,
    community_id: str,
    request_id: str,
):
    select_response = (
        supabase.table("community_post_requests")
        .select("community_id, request_id, reviewed_at")
        .eq("request_id", request_id)
        .single()
        .execute()
    )

    if not select_response.data:
        raise Exception("Request not found")

    request_data = select_response.data

    community_id = request_data["community_id"]
    post_id = request_data["request_id"]
    reviewed_at = request_data["reviewed_at"]

    response = (
        supabase.table("community_posts")
        .insert(
            {
                "community_id": community_id,
                "post_id": post_id,
                "created_at": reviewed_at,
            }
        )
        .execute()
    )

    return response.data
