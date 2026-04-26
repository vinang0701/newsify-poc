import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";

export type UserFollowing = {
    followed_user_id: string;
    name: string;
};

export function useUserFollowing(userId?: string) {
    const [following, setFollowing] = useState<UserFollowing[]>([]);
    const [myFollowing, setMyFollowing] = useState<UserFollowing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { inst_id } = useLocalSearchParams();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const getCurrentUserId = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.log("Error fetching user session", error);
            setError("Error fetching user session");
            return null;
        }
        setCurrentUserId(data.session?.user.id ?? null);
        return;
    };

    const getAccessToken = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);
        return data.session?.access_token ?? null;
    };

    const fetchFollowing = useCallback(async () => {
        try {
            setError(null);

            const token = await getAccessToken();
            if (!token) {
                setError("No active session");
                return;
            }

            const [myRes, userRes] = await Promise.all([
                fetch(`${API_BASE_URL}/${inst_id}/users/me/following`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }),
                userId
                    ? fetch(`${API_BASE_URL}/${inst_id}/users/${userId}/following`, {
                         method: "GET",
                          headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                          },
                      })
                    : null,
            ]);

            const myData = await myRes.json();
            const userData = userRes ? await userRes.json() : [];

            if (!myRes.ok || (userRes && !userRes.ok)) {
                throw new Error("Failed to fetch following");
            }

            setMyFollowing(myData || []);
            setFollowing(userData || []);
        } catch (err: any) {
            setError(err.message);
            setMyFollowing([]);
            setFollowing([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    const refresh = async () => {
        setRefreshing(true);
        await fetchFollowing();
    };

    const followUser = async (targetId: string) => {
        const token = await getAccessToken();
        if (!token) throw new Error("No session");

        console.log("Following user with ID:", targetId);

        const res = await fetch(`${API_BASE_URL}/users/me/following`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ target_user_id: targetId }),
        });

        await fetchFollowing();
    };

    const unfollowUser = async (targetId: string) => {
        const token = await getAccessToken();
        if (!token) throw new Error("No session");

        const res = await fetch(
            `${API_BASE_URL}/users/me/following/${targetId}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        await fetchFollowing();
    };

    const followingUserIds = useMemo(() => {
        return new Set(myFollowing.map((u) => u.followed_user_id));
    }, [myFollowing]);

    useEffect(() => {
        getCurrentUserId();
    }, []);

    useEffect(() => {
        if (userId) fetchFollowing();
    }, [fetchFollowing]);

    return {
        following,
        myFollowing,
        followingUserIds,
        loading,
        refreshing,
        error,
        refresh,
        followUser,
        unfollowUser,
        currentUserId,
    };
}