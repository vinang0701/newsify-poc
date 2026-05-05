from supabase import Client
from typing import List
from app.core.db import supabase
import uuid
from datetime import datetime
from app.models.category import Category


async def get_categories(supabase: Client) -> List[dict]:
    response = supabase.table("categories").select("*").eq("status", "active").execute()

    return [Category(**category) for category in response.data]

async def create_category(
    supabase: Client,
    category_name: str,
    status: str,
    created_by: str,
) -> dict:
    response = (
        supabase.table("categories")
        .insert({
            "category_name": category_name,
            "status": status,
            "created_by": created_by,
        })
        .execute()
    )
    return response.data

async def update_category(
    supabase: Client,
    category_id: str,
    category_name: str,
    status: str,
) -> dict:
    response = (
        supabase.table("categories")
        .update({
            "category_name": category_name,
            "status": status,
        })
        .eq("category_id", category_id)
        .execute()
    )
    return response.data

async def delete_category(
    supabase: Client,
    category_id: str,
) -> dict:
    # Soft delete — set status to inactive
    response = (
        supabase.table("categories")
        .update({"status": "inactive"})
        .eq("category_id", category_id)
        .execute()
    )
    return response.data

async def get_all_categories(supabase: Client) -> List[dict]:
    # Fetch ALL categories including inactive for admin view
    # Join users table to get the name of who created it
    response = (
        supabase.table("categories")
        .select(
            """
            category_id,
            category_name,
            status,
            created_at,
            updated_at,
            created_by,
            users!categories_created_by_fkey(name)
            """
        )
        .order("created_at", desc=True)
        .execute()
    )
    
    # Map the data to include creator's name instead of ID
    result = []
    for cat in response.data:
        result.append({
            "category_id": str(cat["category_id"]),
            "category_name": cat["category_name"],
            "status": cat["status"],
            "created_at": cat["created_at"],
            "updated_at": cat.get("updated_at"),
            "created_by": cat["users"]["name"] if cat.get("users") else "Unknown",
        })
    return result

async def hard_delete_category(supabase: Client, category_id: str) -> dict:
    try:
        # Check if category is being used in user_preferences
        prefs_check = (
            supabase.table("user_preferences")
            .select("category_id")
            .eq("category_id", category_id)
            .limit(1)
            .execute()
        )

        # Check if category is being used in community_categories
        comm_check = (
            supabase.table("community_categories")
            .select("category_id")
            .eq("category_id", category_id)
            .limit(1)
            .execute()
        )

        if prefs_check.data or comm_check.data:
            raise ValueError("Category is currently in use and cannot be deleted.")

        response = (
            supabase.table("categories")
            .delete()
            .eq("category_id", category_id)
            .execute()
        )
        return response.data
    except ValueError:
        raise
    except Exception as e:
        print(f"EXACT ERROR: {e}")
        raise