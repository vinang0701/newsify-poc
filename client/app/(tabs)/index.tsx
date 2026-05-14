import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    RefreshControl,
    Text,
    Pressable,
    ScrollView,
    StyleSheet,
    Alert,
    Modal,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { News } from "@/data/types";
import { Header } from "@/components/header";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import NewsPostCard from "@/components/news_post_card";
// import CommentsModal from "@/components/comments_modal";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image, ImageBackground } from "expo-image";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { usePreferences } from "@/hooks/usePreferences";
import Loading from "@/components/loading";
import NewsPostBottomSheet from "@/components/news_post_bottom_sheet";
import { useUserFollowing } from "@/hooks/useUserFollowing";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const HEADER_HEIGHT = 250;

export default function HomeScreen() {
    const { user, metadata, initialized } = useAuthStore();

    if (!metadata || !user) {
        return null;
    }

    if (!initialized) {
        return null;
    }
    const inst_id = metadata.inst_id;
    const router = useRouter();
    const queryClient = useQueryClient();
    const colorScheme = useColorScheme() ?? "light";
    const [activeFilter, setActiveFilter] = useState("Recent");
    const insets = useSafeAreaInsets();
    // Pull categories from the hook — we reuse this for both steps of the modal
    const { categories, preferences, savePreferences, loading, error } =
        usePreferences();

    const [refreshing, setRefreshing] = React.useState(false);
    const {
        loading: loadingFollow,
        followUser,
        unfollowUser,
    } = useUserFollowing(user.id);

    // Bottom sheet
    const [selectedNewsId, setSelectedNewsId] = useState("");
    const [newsAuthorId, setNewsAuthorId] = useState("");

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const handleSheetExpand = useCallback(
        (news_id: string, news_author_id: string) => {
            setSelectedNewsId(news_id);
            setNewsAuthorId(news_author_id);
            bottomSheetRef?.current?.present();
        },
        [],
    );

    const handleCloseSheet = useCallback(() => {
        bottomSheetRef.current?.dismiss();
    }, []);

    // Suspend post
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);

    // Controls whether the preferences modal is visible
    const [showPrefsModal, setShowPrefsModal] = useState(false);

    // Tracks which step the user is on inside the modal
    // "include" (Pick Interests), "exclude" (What to exclude)
    const [modalStep, setModalStep] = useState<"include" | "exclude">(
        "include",
    );

    // Stores the include category ids selected
    // We need to hold onto them while user goes to
    const [includeIds, setIncludeIds] = useState<string[]>([]);

    // Stores the exclude category ids selected
    const [excludeIds, setExcludeIds] = useState<string[]>([]);

    // Tracks if we are currently saving to DB
    const [savingPrefs, setSavingPrefs] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        refetchPersonalised();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    // Fetch personalised posts — only runs once we have the user's id
    const {
        data: personalisedData,
        refetch: refetchPersonalised,
        isFetching: isFetchingPersonalised,
    } = useQuery<News[]>({
        queryKey: ["news"],
        queryFn: async (): Promise<News[]> => {
            const response = await api.get(
                `/${metadata.inst_id}/news/feed/personalised`,
            );
            // if (!response.ok) throw new Error("Network response was not ok");
            return await response.data;
        },
        enabled: !!user?.id, // only fetch once we have the user id
    });

    const filters = useMemo(() => {
        // 1. The "Recent" item we always want at the start
        const recentItem = {
            user_id: user.id,
            category: {
                category_id: "Recent",
                category_name: "Recent",
                category_status: "active",
            },
            preference_type: "include",
            created_at: "",
        };

        // 2. If preferences hasn't loaded yet, just show "Recent"
        if (!preferences || preferences.length === 0) {
            return [recentItem];
        }

        // 3. Map the nested category objects into a flat list

        // 4. Combine them: "Recent" is now at index 0
        return [recentItem, ...preferences];
    }, [preferences]);

    const handleSavePreferences = async () => {
        if (!user || !metadata) {
            console.error("No user data found.");
            return;
        }

        savePreferences(includeIds, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["user_preferences"],
                });
                Alert.alert("Success", "Your preferences have been updated.");
                setShowPrefsModal(false);
            },
            onError: (err: any) => {
                console.log("Failed to save preferences: " + err.detail);
                Alert.alert("Error", "Failed to save preferences.");
            },
        });
    };

    const filteredNews = useMemo(() => {
        if (!personalisedData) return [];

        if (activeFilter === "Recent") {
            return personalisedData;
        }

        return personalisedData.filter(
            (news) => news.category_id === activeFilter,
        );
    }, [personalisedData, preferences, activeFilter]);

    // report post
    function handleReportPost() {
        // setMenuVisible(false);
        handleCloseSheet();

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
        if (!user.id) {
            Alert.alert(
                "Error",
                "Could not verify your identity. Please try again.",
            );
            return;
        }

        mu_suspendPost();
    };

    const handleEditPress = async () => {
        // Add this safety check at the very top of handleSuspend:
        if (!user.id) {
            Alert.alert(
                "Error",
                "Could not verify your identity. Please try again.",
            );
            return;
        }
        bottomSheetRef.current?.dismiss();

        router.push({
            pathname: "/edit_news_post",
            params: { news_id: selectedNewsId },
        });
    };

    const handleFollowPress = (user_id: string) => {
        followUser(user_id);
        bottomSheetRef.current?.dismiss();
    };

    const handleUnfollowPress = (user_id: string) => {
        unfollowUser(user_id);
        bottomSheetRef.current?.dismiss();
    };

    // if (
    //     isFetchingPersonalised ||
    //     !personalisedData ||
    //     savingPrefs ||
    //     isPendingSuspendPost ||
    //     !user.id ||
    //     !metadata.inst_id ||
    //     loading ||
    //     loadingFollow
    // ) {
    //     return <Loading />;
    // }

    const hasPreferences = preferences && preferences.length > 0;
    useEffect(() => {
        if (preferences && preferences.length === 0) setShowPrefsModal(true);
    }, [preferences]);

    return (
        <SafeAreaView
            edges={["top"]}
            style={[
                {
                    flex: 1,
                    backgroundColor: Colors[colorScheme].bg_light,
                },
            ]}
        >
            <Header />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    paddingBottom: insets.bottom,
                    backgroundColor: Colors[colorScheme].bg,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <FlashList
                    keyExtractor={(item) => item.category.category_id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ marginBottom: 12 }}
                    style={{ elevation: 10 }}
                    data={filters}
                    renderItem={({ item }) => (
                        <Pressable
                            style={{
                                backgroundColor:
                                    activeFilter === item.category.category_id
                                        ? Colors[colorScheme].tint
                                        : Colors[colorScheme].bg_light,
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderColor: Colors[colorScheme].border,
                                borderWidth: 1,
                                marginRight: 8,
                                borderRadius: 4,
                            }}
                            onPress={() => {
                                if (
                                    activeFilter === item.category.category_id
                                ) {
                                    return;
                                } else {
                                    setActiveFilter(item.category.category_id);
                                }
                            }}
                        >
                            <ThemedText
                                type="body_small"
                                emphasized={true}
                                style={{
                                    color:
                                        activeFilter ===
                                        item.category.category_id
                                            ? Colors[colorScheme].button_text
                                            : Colors[colorScheme].tint,
                                }}
                            >
                                {item.category.category_name}
                            </ThemedText>
                        </Pressable>
                    )}
                />

                <FlashList
                    data={filteredNews}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: insets.bottom + 20,
                    }}
                    ListEmptyComponent={() => (
                        <View
                            style={{
                                flex: 1,
                                marginTop: "50%",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <MaterialCommunityIcons
                                name="newspaper-variant-multiple"
                                size={60}
                            />
                            <ThemedText
                                type="sub_heading"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                No news posted yet.
                            </ThemedText>
                            <ThemedText
                                type="default"
                                style={{
                                    color: Colors[colorScheme].text_light,
                                }}
                            >
                                Be the first to share some insights!
                            </ThemedText>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <NewsPostCard
                            news={item}
                            handleSheetExpand={handleSheetExpand}
                        />
                    )}
                />
            </ScrollView>
            {/* BottomSheetModal */}
            <NewsPostBottomSheet
                ref={bottomSheetRef}
                newsAuthorId={newsAuthorId}
                userId={user.id}
                onReport={handleReportPost}
                onSuspend={() => {
                    bottomSheetRef.current?.dismiss();
                    setSuspendModalVisible(true);
                }}
                onFollow={handleFollowPress}
                onUnfollow={handleUnfollowPress}
                onEdit={handleEditPress}
                colorScheme={"light"}
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
            {/* First-time preferences modal */}
            <Modal
                visible={showPrefsModal}
                animationType="slide" // slides up from bottom
                transparent={true} // background is see-through
                onRequestClose={() => {}} // empty — we don't want back button to close it
            >
                {/* Dark overlay behind the modal */}
                <View style={styles.modalOverlay}>
                    {/* White card that contains the content */}
                    <ImageBackground
                        source={require("@/assets/images/gradient-bg-2.png")}
                        style={{
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: 24,
                            height: "100%",
                            gap: 12,
                            backgroundColor: Colors[colorScheme].bg_light,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <ThemedText
                            type="heading"
                            style={[
                                styles.modalTitle,
                                {
                                    color: Colors["light"].button_text,
                                    marginTop: "30%",
                                },
                            ]}
                        >
                            Pick Your Interests
                        </ThemedText>
                        <ThemedText
                            type="default"
                            style={{ color: Colors["light"].button_text }}
                        >
                            Pick at least 3 categories you wish to see on your
                            news
                        </ThemedText>

                        {/* Category chips */}
                        <ScrollView contentContainerStyle={styles.modalGrid}>
                            <View style={styles.grid}>
                                {categories?.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.category_id}
                                        style={[
                                            styles.chip,
                                            {
                                                borderColor:
                                                    Colors["light"].bg_light,
                                                backgroundColor:
                                                    includeIds.includes(
                                                        cat.category_id,
                                                    )
                                                        ? Colors["light"]
                                                              .bg_light
                                                        : "transparent",
                                            },
                                        ]}
                                        onPress={() => {
                                            // Toggle include selection
                                            setIncludeIds((prev) =>
                                                prev.includes(cat.category_id)
                                                    ? prev.filter(
                                                          (c) =>
                                                              c !==
                                                              cat.category_id,
                                                      )
                                                    : [
                                                          ...prev,
                                                          cat.category_id,
                                                      ],
                                            );
                                        }}
                                    >
                                        <ThemedText
                                            style={{
                                                color: includeIds.includes(
                                                    cat.category_id,
                                                )
                                                    ? Colors[colorScheme].text
                                                    : Colors[colorScheme]
                                                          .button_text,
                                            }}
                                        >
                                            {cat.category_name}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <Pressable
                            style={[
                                styles.modalBtn,
                                {
                                    width: "100%",
                                    backgroundColor:
                                        includeIds.length < 3
                                            ? Colors[colorScheme].bg_dark
                                            : Colors[colorScheme].tint,
                                    elevation: 12,
                                    borderRadius: 30,
                                    marginBottom: 24,
                                },
                            ]}
                            onPress={handleSavePreferences}
                            disabled={savingPrefs || includeIds.length < 3}
                        >
                            <ThemedText
                                type="sub_heading"
                                style={{
                                    color: Colors[colorScheme].button_text,
                                }}
                            >
                                Save
                            </ThemedText>
                        </Pressable>
                    </ImageBackground>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_HEIGHT,
        overflow: "hidden",
    },
    bodyContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
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
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    iconsContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 8,
        paddingHorizontal: 12,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)", // dark transparent background
        // justifyContent: "flex-end", // card sticks to bottom like a bottom sheet
    },

    modalCard: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: "80%", // takes up 80% of screen height
        gap: 12,
    },

    modalTitle: { fontWeight: "bold" },
    modalSubtitle: { fontSize: 14 },
    modalGrid: { paddingVertical: 8 },
    modalBtn: {
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8,
    },

    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20, // pill shape
        borderWidth: 2,
    },

    grid: {
        flexDirection: "row", // lay chips left to right
        flexWrap: "wrap", // wrap to next line when row is full
        gap: 10,
    },

    // BottomSheet
    bottomSheet: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 24,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        // paddingVertical: 10,
    },
});
