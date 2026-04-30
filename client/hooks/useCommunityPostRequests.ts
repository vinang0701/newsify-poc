import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";

export type CommunityPostRequest = {
    request_id: string;
    title: string;
    description: string;
    thumbnail?: string | null;
    author: string;
    created_at: string;
    status: "pending" | "approved" | "rejected";
};

export function useCommunityPostRequests(inst_id: string, communityId: string) {
    const [requests, setRequests] = useState<CommunityPostRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAccessToken = async (): Promise<string | null> => {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw new Error(error.message || "Failed to get session");

        return data.session?.access_token ?? null;
    };

    const fetchRequests = useCallback(async () => {
        try {
            setError(null);

            const token = await getAccessToken();

            if (!token) {
                setRequests([]);
                setError("No active session");
                return;
            }

            const res = await fetch(
                `${API_BASE_URL}/${inst_id}/communities/${communityId}/post_requests`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || "Failed to fetch post requests");
            }

            setRequests(data || []);
        } catch (err: any) {
            console.error("fetchCommunityPostRequests error:", err);
            setError(err?.message || "Failed to load requests");
            setRequests([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [communityId]);

    const updatePostRequestStatus = useCallback(
        async (request_id: string, status: "approved" | "rejected", rejection_reason?: string) => {
            try {
                const token = await getAccessToken();

                if (!token) throw new Error("No active session");

                const res = await fetch(
                    `${API_BASE_URL}/${inst_id}/communities/${communityId}/post_requests/${request_id}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            status,
                            rejection_reason,
                        }),
                    }
                );

                const data = await res.json();

                if (!res.ok) throw new Error(data?.detail || "Failed to update post request");

                return data;
            } catch (err: any) {
                console.error("updatePostRequestStatus error:", err);
                throw err;
            }
        },
        [communityId, inst_id]
    );

    const postToCommunity = async (request_id) => {
        const token = await getAccessToken();
        if (!token) throw new Error("No active session");

        await fetch(`${API_BASE_URL}/${inst_id}/communities/${communityId}/news`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ request_id: request_id }),
        });
    };

    const refresh = async () => {
        setRefreshing(true);
        await fetchRequests();
    };

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests,
        loading,
        refreshing,
        error,
        refresh,
        updatePostRequestStatus,
        postToCommunity,
    };
}