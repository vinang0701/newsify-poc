from app.core.db import supabase


VALID_REPORT_REASONS = {
    "Spam",
    "Hate, Abuse, or Harassment",
    "Violent Speech",
    "Graphic or Violent Media",
    "False Information",
    "Bullying",
    "Sexual Content",
}


async def create_post_report(
    post_id: str,
    reported_by_user_id: str,
    reason: str,
    description: str | None = None,
) -> list[dict]:
    if reason not in VALID_REPORT_REASONS:
        raise ValueError("Invalid report reason")

    existing_report = (
        supabase.table("post_reports")
        .select("report_id")
        .eq("post_id", post_id)
        .eq("reported_by_user_id", reported_by_user_id)
        .execute()
    )

    if existing_report.data:
        raise ValueError("You have already reported this post")

    response = (
        supabase.table("post_reports")
        .insert(
            {
                "post_id": post_id,
                "reported_by_user_id": reported_by_user_id,
                "reason": reason,
                "description": description,
                "status": "pending",
            }
        )
        .execute()
    )

    return response.data or []