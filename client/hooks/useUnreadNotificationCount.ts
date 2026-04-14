import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";

type UnreadCountResponse = {
    unread_count: number;
};

export function useUnreadNotificationCount() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const getAccessToken = async (): Promise<string | null> => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message || "Failed to get session");
        return data.session?.access_token ?? null;
    };

    const fetchUnreadCount = useCallback(async () => {
        try {
            const token = await getAccessToken();

            if (!token) {
                setUnreadCount(0);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/me/notifications/unread-count`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.detail || "Failed to fetch unread count");
            }

            const typedData = data as UnreadCountResponse;
            setUnreadCount(typedData.unread_count || 0);
        } catch (err) {
            console.error("fetchUnreadCount error:", err);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    return {
        unreadCount,
        loading,
        refetchUnreadCount: fetchUnreadCount,
    };
}