import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import api from "@/lib/axios";
import { Community, News } from "@/data/types";
import { useAuthStore } from "@/utils/authStore";
import {
    useMutation,
    useQueries,
    useQueryClient,
    useSuspenseQueries,
} from "@tanstack/react-query";

export type UserCommunities = {
    community_id: string;
    community_name: string;
    role: string;
};

export type CommunityDetails = {
    id: string;
    name: string;
    description: string;
    status: string;
    image_url: string;
};

export function useCommunity(communityId?: string) {
    const queryClient = useQueryClient();
    const [myCommunities, setMyCommunities] = useState<UserCommunities[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [members, setMembers] = useState<UserCommunities[]>([]);

    const getAccessToken = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);
        return data.session?.access_token ?? null;
    };

    const { metadata } = useAuthStore();
    const inst_id = metadata?.inst_id;

    const fetchCommunityData = async (): Promise<Community> => {
        const response = await api.get(
            `/${inst_id}/communities/${communityId}`,
        );
        return response.data;
    };

    const fetchCommunityNews = async (): Promise<News[]> => {
        const response = await api.get(
            `/${inst_id}/communities/${communityId}/news`,
        );
        return response.data;
    };

    const [communityResult, newsResult] = useSuspenseQueries({
        queries: [
            {
                queryKey: ["communities", communityId],
                queryFn: fetchCommunityData,
            },
            {
                queryKey: ["communities", communityId, "news"],
                queryFn: fetchCommunityNews,
            },
        ],
    });

    // data is guaranteed to be there if the component renders
    const community = communityResult.data;
    const news = newsResult.data;

    const joinCommunity = async () => {
        const token = await getAccessToken();
        if (!token) throw new Error("No active session");

        await fetch(`${API_BASE_URL}/users/me/communities`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ community_id: communityId }),
        });

        queryClient.invalidateQueries({
            queryKey: ["communities", communityId],
        });
    };

    const leaveCommunity = async () => {
        const token = await getAccessToken();
        if (!token) throw new Error("No active session");

        await fetch(`${API_BASE_URL}/users/me/communities/${communityId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        queryClient.invalidateQueries({
            queryKey: ["communities", communityId],
        });
    };

    const userRole = useMemo(() => {
        if (!communityId || myCommunities.length === 0) return null;

        const community = myCommunities.find(
            (c) => c.community_id === communityId,
        );
        return community?.role ?? null;
    }, [communityId, myCommunities]);

    const myCommunityIds = useMemo(() => {
        return new Set(myCommunities.map((c) => c.community_id));
    }, [myCommunities]);

    const isMember = useMemo(() => {
        if (loading) return false;
        return myCommunityIds.has(communityId ?? "");
    }, [loading, myCommunityIds, communityId]);

    const memberCount = useMemo(() => members.length, [members]);

    useEffect(() => {
        if (communityId) fetchCommunityData();
    }, [fetchCommunityData]);

    return {
        community,
        news,
        memberCount,
        myCommunities,
        myCommunityIds,
        isMember,
        userRole,
        loading: communityResult.isLoading || newsResult.isLoading || loading,
        // refreshing,
        error,
        // refresh,
        refetch: communityResult.refetch || newsResult.refetch,
        joinCommunity,
        leaveCommunity,
        currentUserId,
    };
}
