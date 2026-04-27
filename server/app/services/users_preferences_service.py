from datetime import datetime, timezone
from typing import List
from app.core.db import supabase
from supabase import Client
from app.models.registeredUsers import UserPreference, PreferenceItem


async def get_user_preferences(
    supabase: Client, user_id: uuid.UUID
) -> List[UserPreference]:
    results = (
        supabase.table("user_preferences")
        .select("*, category:categories(category_id,category_name, status)")
        .eq("user_id", str(user_id))
        .eq("preference_type", "include")
        .eq("category.status", "active")
        .order("category(category_name)")
        .execute()
    )

    if not results.data:
        return []

    return [UserPreference(**pref) for pref in results.data]


async def save_user_preferences(
    supabase: Client, user_id: uuid.UUID, preferences: List[PreferenceItem]
):
    # Step 1: Wipe existing preferences for this user to sync state
    supabase.table("user_preferences").delete().eq("user_id", str(user_id)).execute()

    if not preferences:
        return True

    # Step 2: Build rows from the list of objects
    rows = [
        {
            "user_id": str(user_id),
            "category_id": str(item.category_id),
            "preference_type": item.preference_type,
        }
        for item in preferences
    ]

    # Step 3: Bulk Insert
    insert_result = supabase.table("user_preferences").insert(rows).execute()
    if not insert_result:
        return False

    return True
