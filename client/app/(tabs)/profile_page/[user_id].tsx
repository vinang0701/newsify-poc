import {
    Pressable,
    useColorScheme,
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Modal,
    Alert,
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
import { News, UserProfileDetails } from "@/data/types";
import axios from "axios";
import { FlashList } from "@shopify/flash-list";
import NewsPostCard from "@/components/news_post_card";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";

import { useAuthStore } from "@/utils/authStore";
import api from "@/lib/axios";
import NewsPostBottomSheet from "@/components/news_post_bottom_sheet";
import usePosts from "@/hooks/usePosts";

export default function Profile() {
    const { user, metadata } = useAuthStore();

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? "light";

    const user_id = user?.id ?? "";
    const inst_id = metadata?.inst_id ?? "";

    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // suspend modal
    // const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    // usePosts Hook
    const {
        suspendModalVisible,
        setSuspendModalVisible,
        isPendingSuspendPost,
        mu_suspendPost,
    } = usePosts();

    const signOut = useAuthStore((state) => state.signOut);
    const router = useRouter();

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
            router.replace("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };
    // bottom sheet ref
    const [selectedNewsId, setSelectedNewsId] = useState("");
    const [newsAuthorId, setNewsAuthorId] = useState("");
    const handleExpandSheet = useCallback(() => {
        bottomSheetRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    const postBottomSheetRef = useRef<BottomSheetModal>(null);
    const handlePostSheetExpand = useCallback(
        (news_id: string, news_author_id: string) => {
            setSelectedNewsId(news_id);
            setNewsAuthorId(news_author_id);
            postBottomSheetRef?.current?.present();
        },
        [],
    );
    const handlePostCloseSheet = useCallback(() => {
        postBottomSheetRef.current?.dismiss();
    }, []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        ),
        [],
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetch();
        profileRefetch();
        followingCountRefetch();
        followerCountRefetch();

        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    async function fetchUserNews(): Promise<News[]> {
        try {
            const response = await api.get<News[]>(`/users/me/news`);

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
                `/${inst_id}/users/${user_id}`,
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
            pathname: "/(tabs)/profile_page/following",
            params: { user_id: targetUserId, inst_id: inst_id },
        });
    }

    function goToFollowers(targetUserId: string) {
        router.push({
            pathname: "/(tabs)/profile_page/followers",
            params: { user_id: targetUserId, inst_id: inst_id },
        });
    }
    function goToCommunities(targetUserId: string) {
        router.push({
            pathname: "/(tabs)/profile_page/communities",
            params: { user_id: targetUserId, inst_id: inst_id },
        });
    }

    const {
        data: following_count,
        isLoading,
        refetch: followingCountRefetch,
    } = useQuery<number>({
        queryKey: ["following_count", user_id],
        queryFn: async () => {
            const res = await api.get(
                `/${inst_id}/users/${user_id}/following_count`,
            );
            return res.data.count;
        },
        enabled: !!user_id,
    });

    const {
        data: follower_count,
        isLoading: load_followerCount,
        refetch: followerCountRefetch,
    } = useQuery<number>({
        queryKey: ["follower_count", user_id],
        queryFn: async () => {
            const res = await api.get(
                `/${inst_id}/users/${user_id}/follower_count`,
            );
            return res.data.count;
        },
        enabled: !!user_id,
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
        enabled: !!user_id,
    });

    const { status, data, error, isFetching, refetch } = useQuery<News[]>({
        queryKey: ["news", user_id],
        queryFn: fetchUserNews,
        enabled: !!user_id,
    });

    // report post
    function handleReportPost() {
        handlePostCloseSheet();

        router.push({
            pathname: "/report-post",
            params: {
                post_id: selectedNewsId,
                inst_id: inst_id,
            },
        });
    }

    function handleSuspend(news_id: string) {
        if (!user?.id) {
            Alert.alert(
                "Error",
                "Could not verify your identity. Please try again.",
            );
            return;
        }

        if (news_id === "" || !news_id) {
            Alert.alert("Error", "No selected news given. Please try again.");
        }
        mu_suspendPost(news_id);
    }

    const handleEditPress = async () => {
        // Add this safety check at the very top of handleSuspend:
        if (!user?.id) {
            Alert.alert(
                "Error",
                "Could not verify your identity. Please try again.",
            );
            return;
        }
        bottomSheetRef.current?.dismiss();
        postBottomSheetRef.current?.dismiss();
        router.push({
            pathname: "/edit_news_post",
            params: { news_id: selectedNewsId },
        });
    };

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
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
                        router.push({
                            pathname: "/notifications",
                            params: { inst_id: inst_id },
                        });
                    }}
                >
                    <Feather
                        name="bell"
                        size={24}
                        color={Colors[colorScheme].button_text}
                    />
                </Pressable>

                <Image
                    source={require("@/assets/images/icon_light.png")}
                    style={{ width: 42, height: 20, resizeMode: "contain" }}
                />

                <Link href="/search" push asChild>
                    <Pressable>
                        <Feather
                            name="search"
                            size={24}
                            color={Colors[colorScheme].button_text}
                        />
                    </Pressable>
                </Link>
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
                        <Pressable onPress={handleExpandSheet}>
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

                        <View style={styles.statsInfoContainer}>
                            <Pressable
                                onPress={() => goToCommunities(user_id)}
                                style={styles.statsInfoContainer}
                            >
                                <ThemedText type="defaultSemiBold">
                                    4
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
                        </View>

                        <View style={styles.statsInfoContainer}>
                            <Pressable
                                onPress={() => goToFollowers(user_id)}
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
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <NewsPostCard
                                    news={item}
                                    handleSheetExpand={handlePostSheetExpand}
                                />
                            )}
                        />
                    )}
                </View>
                {/* News Card Bottom Sheet */}
                <NewsPostBottomSheet
                    ref={postBottomSheetRef}
                    newsAuthorId={newsAuthorId}
                    userId={user?.id || ""}
                    onReport={handleReportPost}
                    onSuspend={() => {
                        bottomSheetRef.current?.dismiss();
                        setSuspendModalVisible(true);
                    }}
                    onEdit={handleEditPress}
                    colorScheme={"light"}
                />

                <BottomSheetModal
                    ref={bottomSheetRef}
                    backdropComponent={renderBackdrop}
                    enableDynamicSizing
                >
                    <BottomSheetView
                        style={[
                            styles.bottomSheet,
                            { paddingBottom: insets.bottom + 28 },
                        ]}
                    >
                        <Pressable
                            style={styles.modalActionButtonCtn}
                            onPress={() => {
                                bottomSheetRef.current?.dismiss();
                                router.push({
                                    pathname: "/requests",
                                    params: { inst_id: inst_id },
                                });
                            }}
                        >
                            <Feather
                                name="file-text"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                            <ThemedText type="defaultSemiBold">
                                View requests
                            </ThemedText>
                        </Pressable>

                        <Pressable
                            style={styles.modalActionButtonCtn}
                            onPress={() =>
                                router.push({
                                    pathname: "/achievements",
                                    params: { user_id: user_id },
                                })
                            }
                        >
                            <Feather
                                name="award"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                            <ThemedText type="defaultSemiBold">
                                View achievements
                            </ThemedText>
                        </Pressable>

                        <Pressable
                            style={styles.modalActionButtonCtn}
                            onPress={() => {
                                bottomSheetRef.current?.dismiss();
                                router.push("/(tabs)/profile_page/bookmarks");
                            }}
                        >
                            <Feather
                                name="bookmark"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                            <ThemedText type="defaultSemiBold">
                                View bookmarks
                            </ThemedText>
                        </Pressable>

                        <Pressable
                            style={styles.modalActionButtonCtn}
                            onPress={() => {
                                bottomSheetRef.current?.dismiss(); // close the bottom sheet first
                                router.push({
                                    pathname:
                                        "/(tabs)/profile_page/preferences",
                                    params: { inst_id: inst_id }, // pass inst_id like your other routes do
                                });
                            }}
                        >
                            <Feather
                                name="settings"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                            <ThemedText type="defaultSemiBold">
                                Change preference
                            </ThemedText>
                        </Pressable>

                        <Pressable
                            style={styles.modalActionButtonCtn}
                            onPress={() => {
                                bottomSheetRef.current?.dismiss();
                                setModalVisible(true);
                            }}
                        >
                            <Feather
                                name="log-out"
                                size={24}
                                color={Colors[colorScheme].alert_red}
                            />
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: Colors[colorScheme].alert_red,
                                }}
                            >
                                Log out
                            </ThemedText>
                        </Pressable>
                    </BottomSheetView>
                </BottomSheetModal>
                {/* Suspned News confirmation modal */}
                <Modal
                    visible={suspendModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setSuspendModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View
                            style={[
                                styles.modalCard,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                },
                            ]}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{ fontSize: 18 }}
                            >
                                Suspend News Post?
                            </ThemedText>
                            <ThemedText style={{ opacity: 0.6 }}>
                                Are you sure you want to suspend this news post?
                            </ThemedText>
                            <View
                                style={{
                                    flexDirection: "row",
                                    gap: 12,
                                    width: "100%",
                                }}
                            >
                                {/* Cancel button */}
                                <Pressable
                                    style={[
                                        styles.modalBtn,
                                        {
                                            flex: 1,
                                            backgroundColor:
                                                Colors[colorScheme].text,
                                        },
                                    ]}
                                    onPress={() =>
                                        setSuspendModalVisible(false)
                                    }
                                >
                                    <ThemedText
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        }}
                                    >
                                        Cancel
                                    </ThemedText>
                                </Pressable>
                                {/* Suspend button */}
                                {
                                    <Pressable
                                        style={[
                                            styles.modalBtn,
                                            { flex: 1, backgroundColor: "red" },
                                        ]}
                                        onPress={() =>
                                            handleSuspend(selectedNewsId)
                                        }
                                        disabled={isPendingSuspendPost}
                                    >
                                        <ThemedText
                                            style={{
                                                color: Colors[colorScheme]
                                                    .button_text,
                                                textAlign: "center",
                                            }}
                                        >
                                            {isPendingSuspendPost
                                                ? "Suspending..."
                                                : "Suspend"}
                                        </ThemedText>
                                    </Pressable>
                                }
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    visible={modalVisible}
                    backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
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
                                Log out?
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
                                    onPress={() =>
                                        setModalVisible(!modalVisible)
                                    }
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
                                    onPress={handleSignOut}
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
                                        Log out
                                    </ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    // Suspend Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)", // dark transparent background
        justifyContent: "flex-end", // card sticks to bottom like a bottom sheet
    },
    modalCard: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: "80%", // takes up 80% of screen height
        gap: 12,
    },
    modalBtn: {
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8,
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
