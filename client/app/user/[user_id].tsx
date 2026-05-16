import {
    Pressable,
    Text,
    useColorScheme,
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Modal,
} from "react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import {
    Community,
    News,
    UserFollowing,
    UserProfileDetails,
} from "@/data/types";
import axios from "axios";
import { FlashList } from "@shopify/flash-list";
import NewsPostCard from "@/components/news_post_card";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/utils/authStore";
import api from "@/lib/axios";
import { useUserFollowing } from "@/hooks/useUserFollowing";
import Loading from "@/components/loading";
import NewsPostBottomSheet from "@/components/news_post_bottom_sheet";

export default function OtherUserProfileStack() {
    const router = useRouter();
    const { user, session, metadata } = useAuthStore();
    if (!user || !session || !metadata) {
        return router.push("/login");
    }
    const colorScheme = useColorScheme() ?? "light";

    const params = useLocalSearchParams<{
        user_id: string;
        inst_id: string;
    }>();

    const target_user_id = params.user_id ?? "";

    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // News Post Bottom Sheet
    const [selectedNewsId, setSelectedNewsID] = useState("");
    const [newsAuthorId, setNewsAuthorId] = useState("");

    const postBottomSheetRef = useRef<BottomSheetModal>(null);
    const handlePostSheetExpand = useCallback(
        (news_id: string, news_author_id: string) => {
            setSelectedNewsID(news_id);
            setNewsAuthorId(news_author_id);
            postBottomSheetRef?.current?.present();
        },
        [],
    );
    // Suspend post
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch();
        profileRefetch();
        followingCountRefetch();
        followerCountRefetch();
        userCommuntiesRefetch();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const { myFollowing, followUser, unfollowUser, loading } = useUserFollowing(
        user.id,
    );

    const isFollowing = myFollowing.some(
        (user) => user.followed_user_id === target_user_id,
    );

    function handleReportPost() {
        // setMenuVisible(false);
        postBottomSheetRef.current?.dismiss();

        router.push({
            pathname: "/report-post",
            params: {
                post_id: selectedNewsId,
                inst_id: metadata?.inst_id,
            },
        });
    }

    async function fetchUserNews(): Promise<News[]> {
        try {
            const response = await api.get<News[]>(
                `/${metadata?.inst_id}/users/${target_user_id}/news`,
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    async function fetchUserProfile(): Promise<UserProfileDetails> {
        try {
            const response = await api.get<UserProfileDetails[]>(
                `/${metadata?.inst_id}/users/${target_user_id}`,
            );

            return response.data[0];
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    function goToFollowing(targetUserId: string) {
        router.push({
            // pathname: "/(tabs)/profile_page/following",
            pathname: "/user/following",
            params: { user_id: targetUserId, inst_id: metadata?.inst_id },
        });
    }

    function goToFollowers(targetUserId: string) {
        router.push({
            // pathname: "/(tabs)/profile_page/followers",
            pathname: "/user/followers",
            params: { user_id: targetUserId, inst_id: metadata?.inst_id },
        });
    }
    function goToCommunities(targetUserId: string) {
        router.push({
            pathname: "/user/communities",
            params: { user_id: targetUserId, inst_id: metadata?.inst_id },
        });
    }

    const {
        data: following_count,
        isLoading,
        refetch: followingCountRefetch,
    } = useQuery<number>({
        queryKey: ["following_count", target_user_id],
        queryFn: async () => {
            const res = await api.get(
                `/${metadata?.inst_id}/users/${target_user_id}/following_count`,
            );
            return res.data.count;
        },
        enabled: !!target_user_id,
    });

    const {
        data: follower_count,
        isLoading: load_followerCount,
        refetch: followerCountRefetch,
    } = useQuery<number>({
        queryKey: ["follower_count", target_user_id],
        queryFn: async () => {
            const res = await api.get(
                `/${metadata?.inst_id}/users/${target_user_id}/follower_count`,
            );
            return res.data.count;
        },
        enabled: !!target_user_id,
    });

    const {
        data: user_communties,
        isLoading: load_userCommunties,
        refetch: userCommuntiesRefetch,
    } = useQuery<Community[]>({
        queryKey: ["communities"],
        queryFn: async (): Promise<Community[]> => {
            const response = await api(
                `/${metadata?.inst_id}/users/${target_user_id}/communities`,
            );

            return response.data;
        },
        enabled: !!metadata.inst_id && !!target_user_id,
    });

    const {
        data: profileData,
        error: profileError,
        isFetching: profileIsFetching,
        refetch: profileRefetch,
    } = useQuery<UserProfileDetails>({
        queryKey: ["user_profile", target_user_id],
        queryFn: fetchUserProfile,
        enabled: !!target_user_id,
    });

    const { status, data, error, isFetching, refetch } = useQuery<News[]>({
        queryKey: ["news", target_user_id],
        queryFn: fetchUserNews,
        enabled: !!target_user_id,
    });

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            {loading ||
                load_userCommunties ||
                (load_followerCount && <Loading />)}
            <View
                style={[
                    styles.headerContainer,
                    {
                        backgroundColor: Colors[colorScheme].tint,
                    },
                ]}
            >
                <Pressable
                    onPress={() => {
                        router.back();
                    }}
                >
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].button_text}
                    />
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View
                    style={[
                        styles.profileCardContainer,
                        {
                            backgroundColor: Colors[colorScheme].bg_light,
                            borderBottomColor: Colors[colorScheme].border,
                        },
                    ]}
                >
                    <View style={styles.flexRowContainer}>
                        <View style={[styles.flexRowContainer, { gap: 20 }]}>
                            {profileData?.image_url ? (
                                <Image
                                    source={{ uri: profileData?.image_url }}
                                    style={{
                                        width: 68,
                                        height: 68,
                                        borderRadius: 1000,
                                    }}
                                    contentFit="cover"
                                />
                            ) : (
                                <Image
                                    source={require("@/assets/images/profile.png")}
                                    style={{ width: 68, height: 68 }}
                                />
                            )}
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
                        {isFollowing ? (
                            <Pressable
                                style={{
                                    backgroundColor:
                                        Colors[colorScheme].alert_red,
                                    borderRadius: 20,
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                }}
                                onPress={() => setModalVisible(true)}
                            >
                                <ThemedText
                                    type="body_small"
                                    emphasized
                                    style={{
                                        color: Colors[colorScheme].button_text,
                                    }}
                                >
                                    Unfollow
                                </ThemedText>
                            </Pressable>
                        ) : (
                            <Pressable
                                style={{
                                    backgroundColor: Colors[colorScheme].tint,
                                    borderRadius: 20,
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                }}
                                onPress={() => followUser(target_user_id)}
                            >
                                <ThemedText
                                    type="body_small"
                                    emphasized
                                    style={{
                                        color: Colors[colorScheme].button_text,
                                    }}
                                >
                                    Follow
                                </ThemedText>
                            </Pressable>
                        )}
                    </View>

                    <ThemedText
                        type="caption"
                        style={{
                            color: Colors[colorScheme].caption,
                            fontWeight: 700,
                        }}
                    >
                        {profileData?.description}
                    </ThemedText>

                    <View
                        style={[styles.flexRowContainer, styles.statsContainer]}
                    >
                        <View style={styles.statsInfoContainer}>
                            <ThemedText type="defaultSemiBold">
                                {data?.length ?? 0}
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

                        <Pressable
                            style={styles.statsInfoContainer}
                            onPress={() => goToCommunities(target_user_id)}
                        >
                            <ThemedText type="defaultSemiBold">
                                {user_communties?.length}
                            </ThemedText>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].caption,
                                    fontWeight: "500",
                                }}
                            >
                                Communities
                            </ThemedText>
                        </Pressable>

                        <View style={styles.statsInfoContainer}>
                            <Pressable
                                onPress={() => goToFollowers(target_user_id)}
                                style={styles.statsInfoContainer}
                            >
                                <ThemedText type="defaultSemiBold">
                                    {follower_count ?? 0}
                                </ThemedText>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                        fontWeight: "500",
                                    }}
                                >
                                    Followers
                                </ThemedText>
                            </Pressable>
                        </View>

                        <View style={styles.statsInfoContainer}>
                            <Pressable
                                onPress={() => goToFollowing(target_user_id)}
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
                    {status === "pending" ? (
                        <ActivityIndicator
                            size={"large"}
                            color={Colors[colorScheme].tint}
                            style={{ flex: 1 }}
                        />
                    ) : (
                        <FlashList
                            contentContainerStyle={{ flex: 1 }}
                            nestedScrollEnabled={false}
                            ListEmptyComponent={
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <ThemedText
                                        type="sub_heading"
                                        style={{
                                            color: Colors[colorScheme].text,
                                        }}
                                    >
                                        No Posts Yet
                                    </ThemedText>
                                </View>
                            }
                            data={data}
                            renderItem={({ item }) => (
                                <NewsPostCard
                                    news={item}
                                    handleSheetExpand={handlePostSheetExpand}
                                />
                            )}
                        />
                    )}
                </View>
                <Modal
                    animationType="slide"
                    visible={modalVisible}
                    backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.centeredView}>
                        <View
                            style={[
                                styles.modalView,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                },
                            ]}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={styles.modalText}
                            >
                                Unfollow {profileData?.name}?
                            </ThemedText>
                            <View style={{ flexDirection: "row", gap: 24 }}>
                                <Pressable
                                    style={[
                                        styles.button,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].text,
                                        },
                                    ]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={[
                                            styles.textStyle,
                                            {
                                                color: Colors[colorScheme]
                                                    .button_text,
                                            },
                                        ]}
                                    >
                                        Cancel
                                    </ThemedText>
                                </Pressable>
                                <Pressable
                                    style={[
                                        styles.button,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].alert_red,
                                        },
                                    ]}
                                    onPress={() => {
                                        unfollowUser(target_user_id);
                                        setModalVisible(false);
                                    }}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={[
                                            styles.textStyle,
                                            {
                                                color: Colors[colorScheme]
                                                    .button_text,
                                            },
                                        ]}
                                    >
                                        Unfollow
                                    </ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
                <NewsPostBottomSheet
                    ref={postBottomSheetRef}
                    newsAuthorId={newsAuthorId}
                    userId={user?.id ?? ""}
                    colorScheme={colorScheme}
                    onReport={handleReportPost}
                    onSuspend={() => {
                        postBottomSheetRef.current?.dismiss();
                        setSuspendModalVisible(true);
                    }}
                />
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
        borderBottomWidth: 1,
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
    bottomSheet: {
        flex: 0,
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 24,
    },
    modalActionButtonCtn: {
        flex: 0,
        flexDirection: "row",
        gap: 8,
    },
    modalView: {
        width: "100%",
        gap: 16,
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        elevation: 2,
    },
    textStyle: {
        textAlign: "center",
    },
    modalText: {
        fontWeight: "bold",
    },
    centeredView: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
});
