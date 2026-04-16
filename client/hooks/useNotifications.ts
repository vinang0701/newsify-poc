import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";

export type NotificationItem = {
    id: string;
    type: string;
    title: string;
    body: string | null;
    created_at: string;
    is_read: boolean;
    actor_name?: string | null;
    actor_avatar_url?: string | null;
    metadata?: Record<string, any> | null;
};

type NotificationsResponse = {
    items: NotificationItem[];
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAccessToken = async (): Promise<string | null> => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message || "Failed to get session");
        return data.session?.access_token ?? null;
    };

    const fetchNotifications = useCallback(async () => {
        try {
            setError(null);

            const token = await getAccessToken();

            if (!token) {
                setNotifications([]);
                setError("No active session found");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/me/notifications`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.detail || "Failed to fetch notifications");
            }

            const typedData = data as NotificationsResponse;
            setNotifications(typedData.items || []);
        } catch (err: any) {
            setError(err?.message || "Failed to load notifications");
            setNotifications([]);
            console.error("fetchNotifications error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
    };

    const markAsRead = async (notificationId: string) => {
        const token = await getAccessToken();
        if (!token) throw new Error("No active session found");

        const response = await fetch(
            `${API_BASE_URL}/users/me/notifications/${notificationId}/read`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.detail || "Failed to mark notification as read");
        }

        setNotifications((prev) =>
            prev.map((item) =>
                item.id === notificationId ? { ...item, is_read: true } : item
            )
        );
    };

    const markAllAsRead = async () => {
        const token = await getAccessToken();
        if (!token) throw new Error("No active session found");

        const response = await fetch(`${API_BASE_URL}/users/me/notifications/read-all`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.detail || "Failed to mark all as read");
        }

        setNotifications((prev) =>
            prev.map((item) => ({ ...item, is_read: true }))
        );
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        loading,
        refreshing,
        error,
        refresh,
        markAsRead,
        markAllAsRead,
    };
}