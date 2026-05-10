from supabase import Client
from typing import List
from app.models.institutions import Institution


async def get_institutions(supabase: Client) -> List[dict]:
    response = (
        supabase.table("institutions")
        .select("id, name, domain, phone, plan, status, start_date, end_date, created_at")
        .order("created_at", desc=False)
        .execute()
    )
    return [Institution(**inst) for inst in response.data]


async def create_institution(supabase: Client, data: dict) -> dict:
    response = (
        supabase.table("institutions")
        .insert(data)
        .execute()
    )
    return response.data[0]


async def update_institution(supabase: Client, inst_id: str, data: dict) -> dict:
    response = (
        supabase.table("institutions")
        .update(data)
        .eq("id", inst_id)
        .execute()
    )
    return response.data[0]


async def suspend_institution(supabase: Client, inst_id: str) -> dict:
    response = (
        supabase.table("institutions")
        .update({"status": "Suspended"})
        .eq("id", inst_id)
        .execute()
    )
    return response.data[0]


async def activate_institution(supabase: Client, inst_id: str) -> dict:
    response = (
        supabase.table("institutions")
        .update({"status": "Active"})
        .eq("id", inst_id)
        .execute()
    )
    return response.data[0]

async def get_platform_stats(supabase: Client) -> dict:
    students = (
        supabase.table("users")
        .select("id")
        .eq("role", "student")
        .limit(1000)
        .execute()
    )
    staff = (
        supabase.table("users")
        .select("id")
        .eq("role", "staff")
        .limit(1000)
        .execute()
    )
    community_admins = (
        supabase.rpc("get_distinct_community_admin_count")
        .execute()
    )
    return {
        "students": len(students.data),
        "staff_members": len(staff.data),
        "community_admins": community_admins.data,
    }