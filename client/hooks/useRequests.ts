import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type UserRequestItem = {
    id: string;
    request_type: "community_application" | "post_request";
    title: string;
    subtitle?: string | null;
    community_name?: string | null;
    status: "pending" | "approved" | "rejected";
    rejection_reason?: string | null;
    created_at: string;
};

type RequestsResponse = {
    requests: UserRequestItem[];
};

export function useRequests() {
    const [requests, setRequests] = useState<UserRequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAccessToken = async (): Promise<string | null> => {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw new Error(error.message || "Failed to get session");
        }

        return data.session?.access_token ?? null;
    };

    const fetchRequests = useQuery({
        queryKey: ["requests"],
        queryFn: async () => {
            const response = await api.get("/users/me/requests");
            return response.data;
        },
    });

    // const fetchRequests = useCallback(async () => {
    //     try {
    //         setError(null);

    //         const token = await getAccessToken();

    //         if (!token) {
    //             setRequests([]);
    //             setError("No active session found");
    //             return;
    //         }

    //         const response = await api.get(`/users/me/requests`);

    //         const data = await response.json();

    //         if (!response.ok) {
    //             throw new Error(
    //                 data?.detail || "Failed to fetch user requests",
    //             );
    //         }

    //         const typedData = data as RequestsResponse;
    //         setRequests(typedData.requests || []);
    //     } catch (err: any) {
    //         setError(err?.message || "Failed to load requests");
    //         setRequests([]);
    //         console.error("fetchRequests error:", err);
    //     } finally {
    //         setLoading(false);
    //         setRefreshing(false);
    //     }
    // }, []);

    // const refresh = async () => {
    //     setRefreshing(true);
    //     await fetchRequests();
    // };

    // useEffect(() => {
    //     fetchRequests();
    // }, [fetchRequests]);

    return {
        requests: fetchRequests.data,
        loading: fetchRequests.isLoading,
        refreshing: fetchRequests.isRefetching,
        error: fetchRequests.error,
        refresh: fetchRequests.refetch,
    };
}
