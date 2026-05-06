from supabase import Client
from typing import List


async def get_achievements(supabase: Client, inst_id: str) -> List[dict]:
    response = (
        supabase.table("achievements")
        .select("achievement_id, achievement_name, achievement_detail, metric_key, required_count, badge_url, status, created_at")
        .execute()
    )
    return response.data


async def create_achievement(supabase: Client, data: dict) -> dict:
    response = (
        supabase.table("achievements")
        .insert(data)
        .execute()
    )
    return response.data[0]


async def update_achievement(supabase: Client, achievement_id: str, data: dict) -> dict:
    response = (
        supabase.table("achievements")
        .update(data)
        .eq("achievement_id", achievement_id)
        .execute()
    )
    return response.data[0]


async def suspend_achievement(supabase: Client, achievement_id: str) -> dict:
    response = (
        supabase.table("achievements")
        .update({"status": "inactive"})
        .eq("achievement_id", achievement_id)
        .execute()
    )
    return response.data[0]


async def activate_achievement(supabase: Client, achievement_id: str) -> dict:
    response = (
        supabase.table("achievements")
        .update({"status": "active"})
        .eq("achievement_id", achievement_id)
        .execute()
    )
    return response.data[0]
