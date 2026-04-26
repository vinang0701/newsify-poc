from supabase import Client
from typing import List
from app.core.db import supabase
import uuid
from datetime import datetime
from app.models.category import Category


async def get_categories(supabase: Client) -> List[dict]:
    response = supabase.table("categories").select("*").eq("status", "active").execute()

    return [Category(**category) for category in response.data]
