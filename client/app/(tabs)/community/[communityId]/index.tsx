import {
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
    View,
    ScrollView,
    Modal,
    ActivityIndicator,
    Alert,
    BackHandler,
} from "react-native";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Colors } from "@/constants/theme";
import {
    Link,
    useLocalSearchParams,
    useRouter,
    useFocusEffect,
} from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Community, News } from "@/data/types";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NewsPostCard from "@/components/news_post_card";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import Loading from "@/components/loading";
import { useCommunity } from "@/hooks/useCommunity";
import NewsPostBottomSheet from "@/components/news_post_bottom_sheet";
import { Image } from "expo-image";

export default function CommunityPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const colorScheme = useColorScheme() ?? "light";
    const params = useLocalSearchParams<{
        inst_id?: string;
        communityId: string;
    }>();
    const communityId = params.communityId;
    const inst_id = params?.inst_id;
    const router = useRouter();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [selectedSort, setSelectedSort] = useState<
        "Newest" | "Oldest" | "A - Z" | "Z - A"
    >("Newest");

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

    const { community, news, joinCommunity, leaveCommunity, refetch, loading } =
        useCommunity(communityId);

    const sortedNews = useMemo(() => {
        if (!news) return [];

        const sorted = [...news];

        switch (selectedSort) {
            case "Newest":
                sorted.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                );
                break;
            case "Oldest":
                sorted.sort(
                    (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime(),
                );
                break;
            case "A - Z":
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "Z - A":
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }

        return sorted;
    }, [news, selectedSort]);

    const handleExpandSheet = useCallback(
        () => bottomSheetRef.current?.present(),
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
    const getButtonStatus = (item: Community) => {
        if (item.isMember) {
            if (item.member_status === "pending") {
                return "Requested";
            } else {
                return "Leave";
            }
        }

        if (item.public) {
            return "Join";
        }

        return "Request";
    };

    const handleViewMembers = () => {
        router.push({
            pathname: "/community/[communityId]/members",
            params: { communityId: communityId },
        });
        postBottomSheetRef.current?.dismiss();
        bottomSheetRef.current?.dismiss();
    };

    useFocusEffect(
        useCallback(() => {
            refetch();

            const onBackPress = () => {
                // Do your custom logic here (e.g., save draft, open modal)
                router.replace("/(tabs)/community");

                return true; // block default action
            };

            // Add listener on focus
            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress,
            );

            // Remove listener on blur
            return () => subscription.remove();
        }, []),
    );

    function nameToAvatar(name: string) {
        // 1. Split by whitespace and filter out any empty strings from extra spaces
        // 2. Map to the first character and uppercase it
        const initials = name
            .trim()
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase())
            .filter((char) => /^[A-Z0-9]$/.test(char)); // Ensure it's alphanumeric

        // Grab the first two initials
        const first = initials[0] || "";
        const second = initials[1] || "";

        return [first, second];
    }

    const handleJoinCommunity = async () => {
        try {
            await joinCommunity();
            console.log("Joined community successfully");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to join the community.");
        }
    };

    const handleLeaveCommunity = async () => {
        try {
            await leaveCommunity();
            setModalVisible(false);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to leave the community.");
        }
    };

    function handleReportPost() {
        // setMenuVisible(false);
        bottomSheetRef.current?.dismiss();
        postBottomSheetRef.current?.dismiss();

        router.push({
            pathname: "/report-post",
            params: {
                post_id: selectedNewsId,
                inst_id: inst_id,
            },
        });
    }

    const { mutate: mu_suspendPost, isPending: isPendingSuspendPost } =
        useMutation({
            mutationFn: async () => {
                const response = await api.delete(
                    `/users/me/news/${selectedNewsId}`,
                );
                return response.data;
            },
            onSuccess: (data: { status: string; message: string }) => {
                queryClient.invalidateQueries({ queryKey: ["news"] });
                queryClient.invalidateQueries({ queryKey: ["user_news"] });
                Alert.alert(data.status, data.message);
                setSuspendModalVisible(false);
            },

            onError: (err: any) => {
                Alert.alert("Error", err.message || "Failed to suspend post");
            },
        });

    const handleSuspend = async () => {
        // Add this safety check at the very top of handleSuspend:
        if (!user?.id) {
            Alert.alert(
                "Error",
                "Could not verify your identity. Please try again.",
            );
            return;
        }

        mu_suspendPost();
    };

    if (loading && !community) return <Loading />;

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
                <Pressable onPress={() => router.replace("/(tabs)/community")}>
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].button_text}
                        weight="bold"
                    />
                </Pressable>

                <Image
                    source={require("@/assets/images/icon_light.png")}
                    style={{ width: 42, height: 20, resizeMode: "contain" }}
                />

                <Pressable onPress={handleExpandSheet}>
                    <MaterialCommunityIcons
                        name="dots-vertical"
                        size={24}
                        color={Colors[colorScheme].button_text}
                    />
                </Pressable>
            </View>

            {/* Content Container */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    backgroundColor: Colors[colorScheme].bg,
                }}
            >
                {/* Community Info */}
                <View
                    style={{
                        backgroundColor: Colors[colorScheme].bg_light,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        gap: 8,
                    }}
                >
                    <View
                        style={[
                            styles.flexRowContainer,
                            {
                                justifyContent: "space-between",
                            },
                        ]}
                    >
                        <View style={styles.flexRowContainer}>
                            {community.image_url !== null ? (
                                <Image
                                    source={{ uri: community.image_url }}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 50,
                                    }}
                                    contentFit="contain"
                                />
                            ) : (
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 20,
                                        backgroundColor: "hsl(54, 81%, 43%)",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderWidth: 1,
                                        borderColor: "rgba(0,0,0,0.1)", // Subtle border
                                    }}
                                >
                                    <ThemedText
                                        type="body_medium"
                                        emphasized
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text, // White text usually pops best on colors
                                        }}
                                    >
                                        {nameToAvatar(community?.name ?? "")[0]}
                                        {nameToAvatar(community?.name ?? "")[1]}
                                    </ThemedText>
                                </View>
                            )}
                            {/* Community name and Member Count */}

                            <Pressable onPress={handleViewMembers}>
                                <ThemedText type="defaultSemiBold">
                                    {/* Chess Club */}
                                    {community?.name ?? ""}
                                </ThemedText>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    {community.member_count} members
                                </ThemedText>
                            </Pressable>
                        </View>
                        {/* Join Button */}
                        {/* <Pressable
                            style={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                backgroundColor: community.isMember
                                    ? Colors[colorScheme].alert_red
                                    : Colors[colorScheme].bg_light,
                                borderRadius: 20,
                                borderWidth: 2,
                                borderColor: community.isMember
                                    ? "transparent"
                                    : Colors[colorScheme].tint,
                            }}
                            onPress={
                                community.isMember
                                    ? () => setModalVisible(true)
                                    : handleJoinCommunity
                            }
                        >
                            <ThemedText
                                type="body_small"
                                emphasized
                                style={{
                                    color: community.isMember
                                        ? Colors[colorScheme].button_text
                                        : Colors[colorScheme].tint,

                                    fontWeight: "semibold",
                                }}
                            >
                                {community.isMember ? "Leave" : "Join"}
                            </ThemedText>
                        </Pressable> */}

                        <Pressable
                            style={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                backgroundColor:
                                    community.isMember &&
                                    community.member_status === "active"
                                        ? Colors[colorScheme].alert_red
                                        : Colors[colorScheme].bg_light,
                                borderRadius: 20,
                                borderWidth: 2,
                                borderColor:
                                    community.isMember &&
                                    community.member_status === "active"
                                        ? "transparent"
                                        : Colors[colorScheme].tint,
                            }}
                            onPress={() => {
                                community.isMember === false
                                    ? handleJoinCommunity()
                                    : setModalVisible(true);
                            }}
                        >
                            <ThemedText
                                type="body_small"
                                emphasized
                                style={{
                                    color:
                                        community.isMember &&
                                        community.member_status === "active"
                                            ? Colors[colorScheme].button_text
                                            : Colors[colorScheme].tint,

                                    fontWeight: "semibold",
                                }}
                            >
                                {getButtonStatus(community)}
                            </ThemedText>
                        </Pressable>
                    </View>
                    <ThemedText
                        type="caption"
                        style={{
                            color: Colors[colorScheme].caption,
                        }}
                    >
                        {community?.description}
                    </ThemedText>
                </View>

                <View
                    style={{
                        backgroundColor: Colors[colorScheme].bg,
                        paddingHorizontal: 16,
                    }}
                >
                    <Pressable
                        style={[
                            styles.sortButtonContainer,
                            {
                                borderColor: Colors[colorScheme].border,
                                backgroundColor: Colors[colorScheme].bg_light,
                            },
                        ]}
                        onPress={() => setSortMenuVisible(!sortMenuVisible)}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={{ fontSize: 12 }}
                        >
                            Sort
                        </ThemedText>
                        <MaterialCommunityIcons
                            name="chevron-down"
                            size={16}
                            color={Colors[colorScheme].text}
                        />
                    </Pressable>
                    {sortMenuVisible && (
                        <View
                            style={[
                                styles.dropdownMenu,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                },
                            ]}
                        >
                            {["Newest", "Oldest", "A - Z", "Z - A"].map(
                                (option) => (
                                    <Pressable
                                        key={option}
                                        onPress={() => {
                                            setSelectedSort(
                                                option as typeof selectedSort,
                                            );
                                            setSortMenuVisible(false);
                                        }}
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 4,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <ThemedText
                                            type="defaultSemiBold"
                                            style={{
                                                fontWeight:
                                                    selectedSort === option
                                                        ? "bold"
                                                        : "normal",
                                                color: Colors[colorScheme].text,
                                            }}
                                        >
                                            {option}
                                        </ThemedText>

                                        {/* Show check icon if option is selected */}
                                        {selectedSort === option && (
                                            <MaterialCommunityIcons
                                                name="check-bold"
                                                size={20}
                                                color={Colors[colorScheme].text}
                                            />
                                        )}
                                    </Pressable>
                                ),
                            )}
                        </View>
                    )}
                    {news?.length === 0 ? (
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <ThemedText
                                style={{ color: Colors[colorScheme].caption }}
                            >
                                No results found!
                            </ThemedText>
                        </View>
                    ) : (
                        <View>
                            <FlashList
                                nestedScrollEnabled={false}
                                data={sortedNews}
                                renderItem={({ item, index }) => (
                                    <NewsPostCard
                                        news={item}
                                        handleSheetExpand={
                                            handlePostSheetExpand
                                        }
                                    />
                                )}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
            <BottomSheetModal
                name="community_bottom_sheet"
                ref={bottomSheetRef}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
                enableDismissOnClose
            >
                <BottomSheetView
                    style={[
                        styles.bottomSheet,
                        { paddingBottom: insets.bottom + 28 },
                    ]}
                >
                    {community.role === "admin" && (
                        <Pressable
                            style={styles.modalActionButtonCtn}
                            onPress={() => {
                                bottomSheetRef.current?.dismiss();
                                router.push({
                                    pathname:
                                        "/community/[communityId]/post_requests",
                                    params: {
                                        communityId: communityId,
                                        inst_id: inst_id,
                                    },
                                });
                            }}
                        >
                            <Feather
                                name="file-text"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                            <ThemedText type="defaultSemiBold">
                                View post requests
                            </ThemedText>
                        </Pressable>
                    )}
                    <Pressable
                        style={styles.modalActionButtonCtn}
                        onPress={handleViewMembers}
                    >
                        <MaterialCommunityIcons
                            name="account-multiple-outline"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">
                            View members
                        </ThemedText>
                    </Pressable>
                    <Pressable style={styles.modalActionButtonCtn}>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">Report</ThemedText>
                    </Pressable>
                </BottomSheetView>
            </BottomSheetModal>
            {/* News Card Bottom Sheet */}
            <NewsPostBottomSheet
                ref={postBottomSheetRef}
                newsAuthorId={newsAuthorId}
                userId={user?.id ?? ""}
                colorScheme={colorScheme}
                onReport={handleReportPost}
                onSuspend={() => {
                    bottomSheetRef.current?.dismiss();
                    setSuspendModalVisible(true);
                }}
            />
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
                                backgroundColor: Colors[colorScheme].bg_light,
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
                                onPress={() => setSuspendModalVisible(false)}
                            >
                                <ThemedText
                                    style={{
                                        color: Colors[colorScheme].button_text,
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
                                    onPress={handleSuspend}
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
            {/* Join/Leave button Action*/}
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
                            { backgroundColor: Colors[colorScheme].bg_light },
                        ]}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={styles.modalText}
                        >
                            {community.isMember &&
                            community.member_status === "active"
                                ? "Leave group?"
                                : "Remove request?"}
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
                                onPress={() => setModalVisible(!modalVisible)}
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
                                onPress={handleLeaveCommunity}
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
                                    Leave
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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
        gap: 8,
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
    sortButtonContainer: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        marginVertical: 8,
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
    dropdownMenu: {
        position: "absolute",
        top: 42,
        left: 16,
        width: 180,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
    },
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
    modalTitle: { fontSize: 22, fontWeight: "bold" },
    modalSubtitle: { fontSize: 14, opacity: 0.6 },
    modalGrid: { paddingVertical: 8 },
    modalBtn: {
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8,
    },
});
