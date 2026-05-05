from supabase import Client
from typing import List


async def get_categories(supabase: Client, inst_id: str) -> List[dict]:
    response = (
        supabase.table("categories")
        .select("category_id, category_name, status, created_at, updated_at, created_by")
        .execute()
    )
    return response.data


async def update_category(supabase: Client, category_id: str, data: dict) -> dict:
    response = (
        supabase.table("categories")
        .update(data)
        .eq("category_id", category_id)
        .execute()
    )
    return response.data[0]


async def suspend_category(supabase: Client, category_id: str) -> dict:
    response = (
        supabase.table("categories")
        .update({"status": "inactive"})
        .eq("category_id", category_id)
        .execute()
    )
    return response.data[0]


async def activate_category(supabase: Client, category_id: str) -> dict:
    response = (
        supabase.table("categories")
        .update({"status": "active"})
        .eq("category_id", category_id)
        .execute()
    )
    return response.data[0]
