import {
    Pressable,
    Text,
    useColorScheme,
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from "react-native";
import React, { Component } from "react";
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { News, UserProfileDetails } from "@/data/types";
import axios from "axios";
import { FlashList } from "@shopify/flash-list";
import NewsPostCard from "@/components/news_post_card";

const BASE_URL = "http://10.0.2.2:8000/api/v1";
const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

export default function Profile() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? "light";
    const { user_id } = useLocalSearchParams();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        console.log("refetching");
        refetch();
        profileRefetch();
        followingRefetch();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    async function fetchUserNews(): Promise<News[]> {
        console.log("fetching in profile");
        try {
            const response = await axios.get<News[]>(
                `${BASE_URL}/${inst_id}/users/${user_id}/news`,
            );

            return response.data;
        } catch (error) {
            // Re-throwing the error allows TanStack Query to "see" the failure
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    async function fetchUserProfile(): Promise<UserProfileDetails> {
        console.log("fetching user profile");
        try {
            const response = await axios.get<UserProfileDetails[]>(
                `${BASE_URL}/${inst_id}/users/${user_id}`,
            );

            return response.data[0];
        } catch (error) {
            // Re-throwing the error allows TanStack Query to "see" the failure
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    function goToFollowing(user_id: string) {
        console.log(user_id + "'s following");
            router.push({
                pathname: "/(tabs)/profile_page/following",
                params: { user_id: user_id },
            });
        }

    const { data: following_count, isLoading, refetch: followingRefetch } = useQuery<number>({
            queryKey: ["following_count", user_id],
            queryFn: async () => {
                const res = await axios.get(
                    `${BASE_URL}/${inst_id}/users/${user_id}/following_count`,
                );
                return res.data.count;
            },
        });

    const {
        status: profileStatus,
        data: profileData,
        error: profileError,
        isFetching: profileIsFetching,
        refetch: profileRefetch,
    } = useQuery<UserProfileDetails>({
        queryKey: ["user_profile", user_id],
        queryFn: fetchUserProfile,
    });

    const { status, data, error, isFetching, refetch } = useQuery<News[]>({
        queryKey: ["user_news", user_id],
        queryFn: fetchUserNews,
    });

    return (
        <SafeAreaView edges={["top"]}>
            {/* Header */}
            <View
                style={[
                    styles.headerContainer,
                    {
                        backgroundColor: Colors[colorScheme].tint,
                    },
                ]}
            >
                <Pressable onPress={() => router.back()}>
                    <Feather
                        name="bell"
                        size={24}
                        color={Colors[colorScheme].button_text}
                        weight="bold"
                    />
                </Pressable>

                <Image
                    source={require("@/assets/images/icon_light.png")}
                    style={{ width: 42, height: 20, resizeMode: "contain" }}
                />
                <Link href="/search" push asChild>
                    <Pressable onPress={() => {}}>
                        <Feather
                            name="search"
                            size={24}
                            color={Colors[colorScheme].button_text}
                        />
                    </Pressable>
                </Link>
            </View>
            {/* Content */}
            <ScrollView
                contentContainerStyle={{
                    flex: 1,
                    paddingBottom: insets.bottom + 80,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {/* User Profile Card */}
                <View
                    style={[
                        styles.profileCardContainer,
                        { backgroundColor: Colors[colorScheme].bg_light },
                    ]}
                >
                    <View style={styles.flexRowContainer}>
                        <View style={[styles.flexRowContainer, { gap: 20 }]}>
                            <Image
                                source={require("@/assets/images/profile.png")}
                                style={{ width: 68, height: 68 }}
                            />
                            <View>
                                <ThemedText type="defaultSemiBold">
                                    {profileData?.name}
                                </ThemedText>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    University of Wollongong
                                </ThemedText>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    Computer Science
                                </ThemedText>
                            </View>
                        </View>
                        <Pressable>
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                        </Pressable>
                    </View>
                    <ThemedText
                        type="caption"
                        style={{
                            color: Colors[colorScheme].caption,
                            fontWeight: 700,
                        }}
                    >
                        {profileData?.description}
                        {/* Studying Computer Science, but also passionate about
                        writing and sharing school stories. */}
                    </ThemedText>
                    <View
                        style={[styles.flexRowContainer, styles.statsContainer]}
                    >
                        <View style={styles.statsInfoContainer}>
                            <ThemedText type="defaultSemiBold">
                                {data?.length}
                            </ThemedText>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].caption,
                                    fontWeight: "500",
                                }}
                            >
                                News Posts
                            </ThemedText>
                        </View>
                        <View style={styles.statsInfoContainer}>
                            <ThemedText type="defaultSemiBold">4</ThemedText>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].caption,
                                    fontWeight: "500",
                                }}
                            >
                                Communities
                            </ThemedText>
                        </View>
                        <View style={styles.statsInfoContainer}>
                            <ThemedText type="defaultSemiBold">20</ThemedText>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].caption,
                                    fontWeight: "500",
                                }}
                            >
                                Followers
                            </ThemedText>
                        </View>
                        <View style={styles.statsInfoContainer}>
                            <Pressable
                                onPress={() => goToFollowing(user_id)}
                                style={styles.statsInfoContainer}
                                >
                                <ThemedText type="defaultSemiBold">
                                    {following_count ?? 0}
                                </ThemedText>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                        fontWeight: "500",
                                    }}
                                >
                                    Following
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: Colors[colorScheme].bg,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        marginBottom: 16,
                    }}
                >
                    {/* <View
                        style={[
                            styles.sortButtonContainer,
                            {
                                borderColor: Colors[colorScheme].border,
                                backgroundColor: Colors[colorScheme].bg_light,
                            },
                        ]}
                    >
                        <ThemedText>Sort</ThemedText>
                        <MaterialCommunityIcons
                            name="chevron-down"
                            size={16}
                            color={Colors[colorScheme].text}
                        />
                    </View> */}
                    {/* Card */}
                    <FlashList
                        data={data}
                        renderItem={({ item }) => <NewsPostCard news={item} />}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flex: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    flexRowContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    profileCardContainer: {
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    statsContainer: {
        paddingVertical: 8,
        justifyContent: "center",
        gap: 24,
    },
    statsInfoContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    sortButtonContainer: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        marginVertical: 12,
    },
    card: {
        flex: 1,
        gap: 8,
        alignContent: "flex-start",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        marginBottom: 4,
        minHeight: 200,
        elevation: 2,
    },

    iconsContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 8,
    },
});
