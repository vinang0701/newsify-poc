import {
    View,
    StyleSheet,
    Pressable,
    useColorScheme,
    Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Colors } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ThemedText } from "./themed-text";
import { News } from "@/data/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { z } from "zod";
import { useAuthStore } from "@/utils/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import api from "@/lib/axios";

const BASE_URL = "http://10.0.2.2:8000/api/v1";

//UPDATE: inst_id is pased from HomeScreen using authStore metadata.
type NewsPostCardProps = {
    news: News;
    handleSheetExpand: (news_id: string, news_author_id: string) => void;
};

function NewsPostCard({ news, handleSheetExpand }: NewsPostCardProps) {
    const colorScheme = useColorScheme() ?? "light";
    const [bookmark, setBookmark] = useState(news.has_saved);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const router = useRouter();

    const { user, metadata } = useAuthStore();

    if (!user || !metadata) {
        throw new Error("Error occurred when retrieving user data.");
    }

    const queryClient = useQueryClient();

    // Toggle Like Mutation Function
    async function toggleLikePost(post_id: string) {
        const response = await api.post(
            `${metadata?.inst_id}/news/${post_id}/likes`,
        );

        return response.data;
    }

    const { mutate: mu_toggleLikePost, isPending: isPendingToggleLikePost } =
        useMutation({
            mutationFn: toggleLikePost,
            onMutate: async (post_id: string) => {
                // Stop outgoing fetches for "news" so they don't overwrite our optimistic update
                await queryClient.cancelQueries({ queryKey: ["news"] });

                // Snapshot current cache state
                const previousNews = queryClient.getQueryData<News[]>(["news"]);

                // Optimistically update the "news" list
                queryClient.setQueryData<News[]>(["news"], (old) => {
                    if (!old) return [];
                    return old.map((post) => {
                        if (post.id === post_id) {
                            const isLiking = !post.has_liked;
                            return {
                                ...post,
                                has_liked: isLiking,
                                likes_count: isLiking
                                    ? post.likes_count + 1
                                    : Math.max(0, post.likes_count - 1),
                            };
                        }
                        return post;
                    });
                });

                // Return snapshot to context for rollback
                return { previousNews };
            },

            onError: (err, post_id, context) => {
                // Rollback to the exact state before the click
                if (context?.previousNews) {
                    queryClient.setQueryData(["news"], context.previousNews);
                }
                console.error(`Like failed for ${post_id}:`, err);
            },
        });

    function timeAgo(createdAt?: string | Date | null) {
        if (!createdAt) return "";

        const date =
            createdAt instanceof Date ? createdAt : new Date(createdAt);

        if (isNaN(date.getTime())) return "";

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffWeek = Math.floor(diffDay / 7);

        if (diffWeek >= 1) return `${diffWeek}w`;
        if (diffDay >= 1) return `${diffDay}d`;
        if (diffHour >= 1) return `${diffHour}h`;
        if (diffMin >= 1) return `${diffMin}m`;

        return `${diffSec}s`;
    }

    function handleNavigate(user_id: string) {
        console.log(user_id);
        router.push({
            // pathname: "/(tabs)/profile_page/[user_id]",
            pathname: "/[user_id]",
            params: { user_id: user_id },
        });
    }

    const toggleBookmark = async (post_id: string) => {
        if (news.has_saved) {
            // Already saved → unsave it
            const response = await api.delete(`/users/me/saved/${post_id}`);
            return response.data;
        } else {
            // Not saved → save it
            const response = await api.post(`/users/me/saved/${post_id}`);
            return response.data;
        }
    };

    const { mutate: mu_toggleBookmark, isPending: isPendingToggleBookmark } =
        useMutation({
            mutationFn: toggleBookmark,
            onMutate: async (post_id: string) => {
                // Stop outgoing fetches for "news" so they don't overwrite our optimistic update
                await queryClient.cancelQueries({ queryKey: ["news"] });

                // Snapshot current cache state
                const previousNews = queryClient.getQueryData<News[]>(["news"]);

                // Optimistically update the "news" list
                queryClient.setQueryData<News[]>(["news"], (old) => {
                    if (!old) return [];
                    return old.map((post) => {
                        if (post.id === post_id) {
                            const isSaving = !post.has_saved;
                            return {
                                ...post,
                                has_saved: isSaving,
                            };
                        }
                        return post;
                    });
                });

                // Return snapshot to context for rollback
                return { previousNews };
            },

            onError: (err, post_id, context) => {
                // Rollback to the exact state before the click
                if (context?.previousNews) {
                    queryClient.setQueryData(["news"], context.previousNews);
                }
                console.error(`Bookmark failed for ${post_id}:`, err);
            },
        });

    return (
        <View>
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: Colors[colorScheme].bg_light,
                        borderColor: Colors[colorScheme].border,
                    },
                ]}
            >
                <View style={styles.cardInfoContainer}>
                    <Pressable onPress={() => handleNavigate(news.author_id)}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                            }}
                        >
                            <Image
                                source={require("@/assets/images/profile.png")}
                                style={{ width: 28, height: 28 }}
                            />
                            <ThemedText type="defaultSemiBold">
                                {news.author}
                            </ThemedText>
                        </View>
                    </Pressable>
                    <ThemedText
                        type="caption"
                        style={{
                            color: Colors[colorScheme].text,
                        }}
                    >
                        {timeAgo(news.created_at)}
                    </ThemedText>
                    <Pressable
                        style={{ marginLeft: "auto" }}
                        onPress={() => {
                            handleSheetExpand(news.id, news.author_id);
                        }}
                    >
                        <Feather
                            name="more-vertical"
                            size={20}
                            color={Colors[colorScheme].icon}
                        />
                    </Pressable>
                </View>
                <View>
                    {/* Content */}
                    <Image
                        alt="image"
                        source={{
                            uri: news.image_url,
                        }}
                        style={{
                            width: "100%",
                            height: 200,
                            resizeMode: "cover",
                        }}
                    />
                    <ThemedText
                        type="sub_heading"
                        style={{
                            paddingTop: 12,
                            paddingHorizontal: 12,
                            fontSize: 20,
                        }}
                    >
                        {news.title}
                    </ThemedText>
                    <ThemedText
                        style={{
                            paddingVertical: 4,
                            paddingHorizontal: 12,
                            fontSize: 14,
                        }}
                    >
                        {news.description}
                    </ThemedText>
                </View>
                <View style={styles.iconsContainer}>
                    {/* Interaction */}
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            gap: 24,
                        }}
                    >
                        <Pressable
                            style={{
                                flex: 0,
                                flexDirection: "row",
                                gap: 4,
                                alignItems: "center",
                                justifyContent: "flex-start",
                            }}
                            onPress={() => mu_toggleLikePost(news.id)}
                        >
                            {news.has_liked ? (
                                <MaterialCommunityIcons
                                    name="heart"
                                    size={24}
                                    color="red"
                                />
                            ) : (
                                <MaterialCommunityIcons
                                    name="heart-outline"
                                    size={24}
                                    color="black"
                                />
                            )}

                            <ThemedText>{news.likes_count}</ThemedText>
                        </Pressable>
                        {/* <Link href="/comment" push asChild> */}
                        <Pressable
                            style={{
                                flex: 0,
                                flexDirection: "row",
                                gap: 4,
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                            onPress={() =>
                                router.push({
                                    pathname: "/comment",
                                    params: { post_id: news.id },
                                })
                            }
                        >
                            <Feather
                                name="message-square"
                                size={24}
                                color="black"
                            />
                            <ThemedText>{news.comments_count}</ThemedText>
                        </Pressable>
                        {/* </Link> */}
                    </View>
                    <Pressable
                        onPress={() => mu_toggleBookmark(news.id)}
                        disabled={bookmarkLoading}
                    >
                        {news.has_saved ? (
                            <MaterialCommunityIcons
                                name="bookmark"
                                size={24}
                                color={Colors[colorScheme].tint}
                            />
                        ) : (
                            <MaterialCommunityIcons
                                name="bookmark-outline"
                                size={24}
                                color="black"
                            />
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        gap: 8,
        alignContent: "flex-start",
        borderRadius: 8,
        borderWidth: 1,
        elevation: 2,
        paddingVertical: 12,
        marginBottom: 4,
        minHeight: 200,
    },
    cardInfoContainer: {
        flex: 1,
        gap: 8,
        marginBottom: 4,
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 12,
    },
    iconsContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 8,
        paddingHorizontal: 12,
    },
});

export default NewsPostCard;
