from supabase import Client
from typing import List
from app.models.community import Community, CommunityMembers
from app.core.db import supabase


# join table between communities and community_members
async def get_user_communities(
    supabase: Client, inst_id: str, user_id: str
) -> List[dict]:
    response = (
        supabase.table("communities")
        .select("*, community_members!inner(*)")
        .eq("community_members.user_id", str(user_id))
        .execute()
    )
    communities = []
    print(response.data)
    return [
        CommunityMembers(
            community_id=comm_mem["id"],
            community_name=comm_mem["name"],
            role=(
                comm_mem["community_members"][0]["role"]
                if comm_mem.get("community_members")
                else "unknown"
            ),
        )
        for comm_mem in response.data
    ]
