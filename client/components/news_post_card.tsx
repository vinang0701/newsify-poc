import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useColorScheme,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { ThemedText } from "./themed-text";
import { ModalProps, News } from "@/data/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/utils/authStore";
import api from "@/lib/axios";
import { z } from "zod";

type NewsPostCardProps = {
    news: News;
};

const ToggleLikeSchema = z.object({
    status: z.string(),
    data: z.object({
        new_likes_count: z.number(),
        is_liked: z.boolean(),
    }),
});

type ToggleLikeResponse = z.infer<typeof ToggleLikeSchema>;

function NewsPostCard({ news }: NewsPostCardProps) {
    const colorScheme = useColorScheme() ?? "light";
    // const [like, setLike] = useState(news.has_liked);
    const [bookmark, setBookmark] = useState(news.has_saved);
    // const [likeCount, setLikeCount] = useState(news.likes_count);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, metadata } = useAuthStore();

    if (!user || !metadata) {
        throw new Error("Error occurred when retrieving user data.");
    }

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

    function handleNavigate(user_id: string) {
        console.log(user_id);
        router.push({
            // pathname: "/(tabs)/profile_page/[user_id]",
            pathname: "/[user_id]",
            params: { user_id: user_id },
        });
    }

    return (
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
                    type="default"
                    style={{
                        fontSize: 10,
                        color: "hsl(0, 0%, 5%)",
                    }}
                >
                    1d
                </ThemedText>
                <Pressable style={{ marginLeft: "auto" }}>
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
                    {news.content["text"]?.replace(/\s*\[\+\d+ chars\]$/, "") ||
                        ""}
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
                <Pressable onPress={() => setBookmark(!bookmark)}>
                    {bookmark ? (
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
