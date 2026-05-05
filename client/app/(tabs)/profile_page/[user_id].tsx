import {
    Pressable,
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
import { supabase } from "@/lib/supabase";
import api from "@/lib/axios";

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
    const selectedNewsId = useRef("");
    const newsAuthorId = useRef("");
    const handleExpandSheet = useCallback(() => {
        bottomSheetRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);

    const postBottomSheetRef = useRef<BottomSheetModal>(null);
    const handlePostSheetExpand = useCallback(
        (news_id: string, news_author_id: string) => {
            selectedNewsId.current = news_id;
            newsAuthorId.current = news_author_id;
            postBottomSheetRef?.current?.present();
        },
        [],
    );

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
            const response = await api.get<News[]>(
                `/${inst_id}/users/${user_id}/news`,
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

    const { data: currentUser } = useQuery({
        queryKey: ["current_user"],
        queryFn: async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            return user;
        },
    });

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
                <BottomSheetModal
                    ref={postBottomSheetRef}
                    backdropComponent={renderBackdrop}
                >
                    <BottomSheetView
                        style={[
                            styles.bottomSheet,
                            { paddingBottom: insets.bottom + 28 },
                        ]}
                    >
                        <Pressable style={styles.modalActionButtonCtn}>
                            <Feather
                                name="user-plus"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                            <ThemedText
                                type="defaultSemiBold"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                Follow
                            </ThemedText>
                        </Pressable>

                        <Pressable
                            style={styles.modalActionButtonCtn}
                            // onPress={handleReportPost}
                        >
                            <Feather
                                name="alert-circle"
                                size={24}
                                color={Colors[colorScheme].alert_red}
                            />
                            <ThemedText
                                type="defaultSemiBold"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                Report post
                            </ThemedText>
                        </Pressable>
                        {/* Only show suspend option if this is the user's own post */}
                        {newsAuthorId.current === user?.id && (
                            <Pressable
                                style={styles.modalActionButtonCtn}
                                onPress={() => {
                                    bottomSheetRef.current?.dismiss();
                                    // setSuspendModalVisible(true); // show confirmation modal
                                }}
                            >
                                <Feather
                                    name="x-circle"
                                    size={24}
                                    color={Colors[colorScheme].alert_red}
                                />
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={{
                                        color: Colors[colorScheme].alert_red,
                                    }}
                                >
                                    Suspend news post
                                </ThemedText>
                            </Pressable>
                        )}
                    </BottomSheetView>
                </BottomSheetModal>

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
