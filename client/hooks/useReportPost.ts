import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";

export async function reportPost(
    instId: String,
    postId: string,
    reason: string,
    description?: string
) {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.access_token) {
        throw new Error("No active session found");
    }

    const response = await fetch(
        `${API_BASE_URL}/${instId}/news/${postId}/report`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${data.session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reason,
                description: description || null,
            }),
        }
    );

    const raw = await response.text();

    let result;
    try {
        result = JSON.parse(raw);
    } catch {
        throw new Error(raw || "Invalid server response");
    }

    if (!response.ok) {
        throw new Error(result?.detail || "Failed to report post");
    }

    return result;
}