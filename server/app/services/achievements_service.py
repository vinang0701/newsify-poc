from app.core.db import supabase


async def get_user_achievement_metrics(user_id: str) -> dict:
    posts = (
        supabase.table("news_posts")
        .select("id")
        .eq("author_id", user_id)
        .execute()
    )

    followers = (
        supabase.table("user_followers")
        .select("follower_user_id")
        .eq("followed_user_id", user_id)
        .execute()
    )

    likes = (
        supabase.table("post_likes")
        .select("post_id")
        .eq("user_id", user_id)
        .execute()
    )

    comments = (
        supabase.table("post_comments")
        .select("comment_id")
        .eq("commented_by_user_id", user_id)
        .execute()
    )

    communities = (
        supabase.table("community_members")
        .select("community_id")
        .eq("user_id", user_id)
        .execute()
    )

    return {
        "posts_created": len(posts.data or []),
        "followers": len(followers.data or []),
        "posts_liked": len(likes.data or []),
        "comments_created": len(comments.data or []),
        "communities_joined": len(communities.data or []),
    }


async def get_user_achievements(user_id: str) -> list[dict]:
    metrics = await get_user_achievement_metrics(user_id)

    response = (
        supabase.table("achievements")
        .select("*")
        .order("achievement_name")
        .order("required_count")
        .execute()
    )

    result = []

    for item in response.data or []:
        current = metrics.get(item.get("metric_key"), 0)
        required = item.get("required_count", 0)

        result.append({
            "id": item.get("achievement_id"),
            "achievement_id": item.get("achievement_id"),
            "achievement_name": item.get("achievement_name"),
            "achievement_detail": item.get("achievement_detail"),
            "metric_key": item.get("metric_key"),
            "required_count": required,
            "current_count": current,
            "is_completed": current >= required,
            "badge_url": item.get("badge_url"),
        })

    return result