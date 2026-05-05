import {
    Text,
    StyleSheet,
    View,
    Pressable,
    TextInput,
    useColorScheme,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import api from "@/lib/axios";

const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

interface PostResult {
    id: string;
    author_id: string;
    author: string;
    title: string;
    description: string;
    image_url: string;
}

interface UserResult {
    id: string;
    name: string;
    image_url: string | null;
}

export default function Search() {
    const router = useRouter();
    const colorScheme = useColorScheme() || "light";
    const [isActive, setIsActive] = useState<"posts" | "users">("posts");
    const [searchQuery, setSearchQuery] = useState("");

    // -----------------------------------------------------------------------
    // Posts search
    // -----------------------------------------------------------------------
    const { data: postResults, isFetching: postsFetching } = useQuery<
        PostResult[]
    >({
        queryKey: ["search_posts", searchQuery],
        queryFn: async () => {
            if (!searchQuery || searchQuery.length < 2) return [];
            const response = await api.get(`/${inst_id}/search/posts`, {
                params: { q: searchQuery },
            });
            return response.data;
        },
        enabled: isActive === "posts" && searchQuery.length >= 2,
    });

    // -----------------------------------------------------------------------
    // Users search
    // -----------------------------------------------------------------------
    const { data: userResults, isFetching: usersFetching } = useQuery<
        UserResult[]
    >({
        queryKey: ["search_users", searchQuery],
        queryFn: async () => {
            if (!searchQuery || searchQuery.length < 2) return [];
            const response = await api.get(`/${inst_id}/search/users`, {
                params: { q: searchQuery },
            });
            return response.data;
        },
        enabled: isActive === "users" && searchQuery.length >= 2,
    });

    const isEmpty =
        isActive === "posts"
            ? !postsFetching && (!postResults || postResults.length === 0)
            : !usersFetching && (!userResults || userResults.length === 0);

    return (
        <SafeAreaView
            edges={["top"]}
            style={{ flex: 1, backgroundColor: Colors[colorScheme].bg }}
        >
            {/* Search Bar Header */}
            <View
                style={[
                    styles.searchBarContainer,
                    { backgroundColor: Colors[colorScheme].tint },
                ]}
            >
                <Pressable onPress={router.back}>
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].button_text}
                    />
                </Pressable>

                <TextInput
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Colors[colorScheme].bg_dark}
                    autoFocus
                    style={[
                        styles.searchInput,
                        {
                            borderColor: Colors[colorScheme].bg,
                            borderWidth: 1,
                            color: Colors[colorScheme].button_text,
                        },
                    ]}
                />
            </View>

            {/* Tabs */}
            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: Colors[colorScheme].bg_light,
                    borderBottomWidth: 1,
                    borderBottomColor: Colors[colorScheme].border,
                }}
            >
                <Pressable
                    style={[
                        styles.tab,
                        isActive === "posts" && {
                            borderBottomWidth: 3,
                            borderBottomColor: Colors[colorScheme].tint,
                        },
                    ]}
                    onPress={() => setIsActive("posts")}
                >
                    <ThemedText
                        type="body_medium"
                        emphasized
                        style={{
                            color:
                                isActive === "posts"
                                    ? Colors[colorScheme].tint
                                    : Colors[colorScheme].caption,
                        }}
                    >
                        Posts
                    </ThemedText>
                </Pressable>
                <Pressable
                    style={[
                        styles.tab,
                        isActive === "users" && {
                            borderBottomWidth: 3,
                            borderBottomColor: Colors[colorScheme].tint,
                        },
                    ]}
                    onPress={() => setIsActive("users")}
                >
                    <ThemedText
                        type="body_medium"
                        emphasized
                        style={{
                            color:
                                isActive === "users"
                                    ? Colors[colorScheme].tint
                                    : Colors[colorScheme].caption,
                        }}
                    >
                        Users
                    </ThemedText>
                </Pressable>
            </View>

            {/* Results */}
            {isEmpty && searchQuery.length >= 2 ? (
                <View style={styles.emptyContainer}>
                    <ThemedText
                        type="body_medium"
                        style={{ color: Colors[colorScheme].caption }}
                    >
                        No {isActive === "posts" ? "Posts" : "Users"} Found
                    </ThemedText>
                </View>
            ) : isActive === "posts" ? (
                // ---------------------------------------------------------------
                // Posts list
                // ---------------------------------------------------------------
                <FlashList
                    data={postResults ?? []}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <Pressable
                            style={[
                                styles.postCard,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                    borderColor: Colors[colorScheme].border,
                                },
                            ]}
                            onPress={() =>
                                router.push({
                                    pathname: "/comment",
                                    params: { postId: item.id },
                                })
                            }
                        >
                            {/* Author row */}
                            <View style={styles.authorRow}>
                                <Image
                                    source={require("@/assets/images/profile.png")}
                                    style={styles.avatar}
                                />
                                <ThemedText type="defaultSemiBold">
                                    {item.author}
                                </ThemedText>
                            </View>

                            {/* Post image */}
                            {item.image_url ? (
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={styles.postImage}
                                    contentFit="cover"
                                />
                            ) : null}

                            {/* Title & description */}
                            <ThemedText
                                type="defaultSemiBold"
                                style={{ marginTop: 8 }}
                            >
                                {item.title}
                            </ThemedText>
                            {item.description ? (
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                        marginTop: 4,
                                    }}
                                    numberOfLines={2}
                                >
                                    {item.description}
                                </ThemedText>
                            ) : null}
                        </Pressable>
                    )}
                />
            ) : (
                // ---------------------------------------------------------------
                // Users list
                // ---------------------------------------------------------------
                <FlashList
                    data={userResults ?? []}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.userRow}
                            onPress={() =>
                                router.push(`/(tabs)/profile_page/${item.id}`)
                            }
                        >
                            <Image
                                source={
                                    item.image_url
                                        ? { uri: item.image_url }
                                        : require("@/assets/images/profile.png")
                                }
                                style={styles.avatar}
                            />
                            <ThemedText type="defaultSemiBold">
                                {item.name}
                            </ThemedText>
                        </Pressable>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    searchBarContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
        gap: 12,
    },
    searchInput: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        fontSize: 14,
    },
    tab: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    postCard: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 12,
        marginBottom: 12,
    },
    authorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    postImage: {
        width: "100%",
        height: 180,
        borderRadius: 6,
        marginTop: 4,
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },
});
