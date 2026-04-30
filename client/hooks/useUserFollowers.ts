import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/constants/api";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";

export type UserFollowers = {
    follower_user_id: string;
    name: string;
};

export function useUserFollowers(userId?: string) {
    const [followers, setFollowers] = useState<UserFollowers[]>([]);
    const [myFollowing, setMyFollowing] = useState<UserFollowers[]>([]);
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

    const fetchUserFollowers = useCallback(async () => {
        try {
            setError(null);

            const token = await getAccessToken();
            if (!token) {
                setError("No active session");
                return;
            }

            if (!userId) return;

            const res = await fetch(
                `${API_BASE_URL}/${inst_id}/users/${userId}/followers`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!res.ok) {
                const errorData = await res.json();
                console.error(
                    "Failed to fetch user's followers:",
                    errorData?.message || res.statusText,
                );
                throw new Error(
                    errorData?.message || "Failed to fetch user's followers",
                );
            }

            const data = await res.json();
            setFollowers(data || []);
        } catch (err: any) {
            setError(err.message);
            setFollowers([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    // Fetching My Following
    const fetchMyFollowing = useCallback(async () => {
        try {
            setError(null);

            const token = await getAccessToken();
            if (!token) {
                setError("No active session");
                return;
            }

            const res = await fetch(
                `${API_BASE_URL}/${inst_id}/users/me/following`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!res.ok) {
                const errorData = await res.json();
                console.error(
                    "Failed to fetch following:",
                    errorData?.message || res.statusText,
                );
                throw new Error(
                    errorData?.message || "Failed to fetch following",
                );
            }

            const data = await res.json();
            setMyFollowing(data || []);
        } catch (err: any) {
            setError(err.message);
            setMyFollowing([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refresh = async () => {
        setRefreshing(true);
        await fetchUserFollowers();
    };

    const followUser = async (targetId: string) => {
        try {
            const token = await getAccessToken();
            if (!token) throw new Error("No session");

            console.log("Following user with ID:", targetId);

            const res = await fetch(`${API_BASE_URL}/users/me/following`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ followed_user_id: targetId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error(
                    "Failed to follow user:",
                    errorData?.message || res.statusText,
                );
                throw new Error(errorData?.message || "Failed to follow user");
            }

            await fetchMyFollowing();
        } catch (err: any) {
            console.error("Error during follow:", err.message || err);
        }
    };

    const unfollowUser = async (targetId: string) => {
        try {
            const token = await getAccessToken();
            if (!token) throw new Error("No session");

            const res = await fetch(
                `${API_BASE_URL}/users/me/following/${targetId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (!res.ok) {
                const errorData = await res.json();
                console.error(
                    "Failed to unfollow user:",
                    errorData?.message || res.statusText,
                );
                throw new Error(
                    errorData?.message || "Failed to unfollow user",
                );
            }

            await fetchMyFollowing();
        } catch (err: any) {
            console.error("Error during unfollow:", err.message || err);
        }
    };

    const followingUserIds = useMemo(() => {
        return new Set(myFollowing.map((u) => u.follower_user_id));
    }, [myFollowing]);

    useEffect(() => {
        getCurrentUserId();
    }, []);

    useEffect(() => {
        if (userId) fetchUserFollowers();
    }, [fetchUserFollowers]);

    return {
        followers,
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
