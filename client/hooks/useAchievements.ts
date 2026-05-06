import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "@/constants/api";

export type Achievement = {
    achievement_id: string;
    achievement_name: string;
    achievement_detail: string;
    metric_key: string;
    required_count: number;
    current_count: number;
    is_completed: boolean;
    badge_url?: string | null;
};

async function fetchAchievements(): Promise<Achievement[]> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        throw new Error("Authentication failed");
    }

    const response = await fetch(`${API_BASE_URL}/users/me/achievements`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.detail || "Failed to load achievements");
    }

    return result.items || [];
}

export function useAchievements() {
    return useQuery({
        queryKey: ["my-achievements"],
        queryFn: fetchAchievements,
    });
}