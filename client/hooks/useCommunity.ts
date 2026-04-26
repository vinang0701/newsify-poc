import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";

export type UserCommunities = {
    community_id: string;
    community_name: string;
    role: string;
};

export type CommunityDetails = {
    id: string;
    created_by_user_id: string;
    name: string;
    description: string;
    status: string;
    image_url: string;
};

export type News = {
    id: string;
    title: string;
    description: string;
    image_url: string;
    created_at: string;
};

export function useCommunity(communityId?: string) {
    const { inst_id } = useLocalSearchParams();

    const [community, setCommunity] = useState<CommunityDetails | null>(null);
    const [news, setNews] = useState<News[]>([]);
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

    const fetchCommunityData = useCallback(async () => {
        try {
            setError(null);

            if (!communityId) return;

            const token = await getAccessToken();
            if (!token) {
                setError("No active session");
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const [myCommRes, commRes, newsRes, membersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/users/me/communities`, { headers }),
                fetch(`${API_BASE_URL}/${inst_id}/communities/${communityId}`, { headers }),
                fetch(`${API_BASE_URL}/${inst_id}/communities/${communityId}/news`, { headers }),
                fetch(`${API_BASE_URL}/${inst_id}/communities/${communityId}/members`, { headers }),
            ]);

            const myCommData = await myCommRes.json();
            const commData = await commRes.json();
            const newsData = await newsRes.json();
            const membersData = await membersRes.json();

            if (!myCommRes.ok || !commRes.ok || !newsRes.ok || !membersRes.ok) {
                console.warn("Some fetches failed", { myCommData, commData, newsData, membersData });
            }

            setMyCommunities(Array.isArray(myCommData) ? myCommData : []);
            setCommunity(commRes.ok ? commData : null);
            setNews(Array.isArray(newsData) ? newsData : []);
            setMembers(Array.isArray(membersData) ? membersData : []);
        } catch (err: any) {
            console.error("fetchCommunityData error:", err);
            setError(err.message);
            setCommunity(null);
            setNews([]);
            setMyCommunities([]);
            setMembers([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [communityId, inst_id]);

    const refresh = async () => {
        setRefreshing(true);
        await fetchCommunityData();
    };

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

        await fetchCommunityData();
    };

    const leaveCommunity = async () => {
        const token = await getAccessToken();
        if (!token) throw new Error("No active session");

        await fetch(`${API_BASE_URL}/users/me/communities/${communityId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        await fetchCommunityData();
    };

    const userRole = useMemo(() => {
        if (!communityId || myCommunities.length === 0) return null;

        const community = myCommunities.find(c => c.community_id === communityId);
        return community?.role ?? null;
    }, [communityId, myCommunities]);

    const myCommunityIds = useMemo(() => {
        return new Set(myCommunities.map((c) => c.community_id));
    }, [myCommunities]);

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
        isMember: communityId ? myCommunityIds.has(communityId) : false,
        userRole,
        loading,
        refreshing,
        error,
        refresh,
        joinCommunity,
        leaveCommunity,
        currentUserId,
    };
}