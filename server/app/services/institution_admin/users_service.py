from supabase import Client
from typing import List
from app.models.admin import User
from app.core.db import supabase


async def get_student_users(supabase: Client, inst_id: str) -> List[dict]:

    response = (
        supabase.table("users")
        .select(
            """
            id,
            name,
            email,
            role,
            is_active,
            created_at,
            updated_at
        """
        )
        .eq("inst_id", inst_id)
        .eq("role", "student")
        .execute()
    )

    return [User(**user) for user in response.data]
