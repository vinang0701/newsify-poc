from supabase import Client
from typing import List
from pydantic import EmailStr
import uuid
from app.models.admin import User, CreateUser
from app.core.db import supabase


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