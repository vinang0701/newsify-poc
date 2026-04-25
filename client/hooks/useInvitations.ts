import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";

export type InvitationItem = {
    id: string;
    community_id: string;
    community_name: string;
    inviter_name?: string | null;
    inviter_avatar_url?: string | null;
    status: "pending" | "accepted" | "declined";
    created_at: string;
    rejection_reason?: string | null;
};

type InvitationsResponse = {
    items: InvitationItem[];
};

export function useInvitations() {
    const [invitations, setInvitations] = useState<InvitationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAccessToken = async (): Promise<string | null> => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message || "Failed to get session");
        return data.session?.access_token ?? null;
    };

    const fetchInvitations = useCallback(async () => {
        try {
            setError(null);

            const token = await getAccessToken();

            if (!token) {
                setInvitations([]);
                setError("No active session found");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/me/invitations`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.detail || "Failed to fetch invitations");
            }

            const typedData = data as InvitationsResponse;
            setInvitations(typedData.items || []);
        } catch (err: any) {
            setError(err?.message || "Failed to load invitations");
            setInvitations([]);
            console.error("fetchInvitations error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refresh = async () => {
        setRefreshing(true);
        await fetchInvitations();
    };

    const respondToInvitation = async (
        invitationId: string,
        action: "accepted" | "declined"
    ) => {
        const token = await getAccessToken();
        if (!token) throw new Error("No active session found");

        const response = await fetch(
            `${API_BASE_URL}/users/me/invitations/${invitationId}/respond`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.detail || "Failed to respond to invitation");
        }

        setInvitations((prev) =>
            action === "declined"
                ? prev.filter((item) => item.id !== invitationId)
                : prev.map((item) =>
                    item.id === invitationId ? { ...item, status: action } : item
            )
        );
    };

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    return {
        invitations,
        loading,
        refreshing,
        error,
        refresh,
        respondToInvitation,
    };
}