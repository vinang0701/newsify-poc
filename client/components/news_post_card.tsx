import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useColorScheme,
    Alert,
    Modal,
} from "react-native";
import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import { Colors } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { ThemedText } from "./themed-text";
import { News } from "@/data/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
    TouchableHighlight,
} from "@gorhom/bottom-sheet";
import { z } from "zod";
import { useAuthStore } from "@/utils/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import api from "@/lib/axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const BASE_URL = "http://10.0.2.2:8000/api/v1";

//UPDATE: inst_id is pased from HomeScreen using authStore metadata.
type NewsPostCardProps = {
    news: News;
    currentUserId?: string; //if not passed, suspend wont show. need to check if current user is the logged in user to be able to suspend own post
    inst_id: string;
};

const ToggleLikeSchema = z.object({
    status: z.string(),
    data: z.object({
        new_likes_count: z.number(),
        is_liked: z.boolean(),
    }),
});

type ToggleLikeResponse = z.infer<typeof ToggleLikeSchema>;

function NewsPostCard({ news, currentUserId, inst_id }: NewsPostCardProps) {
    const colorScheme = useColorScheme() ?? "light";
    // const [like, setLike] = useState(news.has_liked);
    const [bookmark, setBookmark] = useState(news.has_saved);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    // const [likeCount, setLikeCount] = useState(news.likes_count);
    const [menuVisible, setMenuVisible] = useState(false);
    const router = useRouter();
    const { bottom: bottomSafeArea } = useSafeAreaInsets();

    // const bottomSheetRef = useRef<BottomSheet>(null);
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["20%"], []);
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    const [suspending, setSuspending] = useState(false);

    // const handleExpandSheet = () => bottomSheetRef.current?.expand();
    const handleExpandSheet = useCallback(() => {
        bottomSheetRef.current?.present();
    }, []);
    const handleCloseSheet = useCallback(() => {
        bottomSheetRef.current?.dismiss();
    }, []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log("handleSheetChanges", index);
    }, []);
    const { user, metadata } = useAuthStore();

    if (!user || !metadata) {
        throw new Error("Error occurred when retrieving user data.");
    }

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

    const queryClient = useQueryClient();

    // Add below your existing useEffect or state declarations
    useEffect(() => {
        const checkSaved = async () => {
            if (!currentUserId) return;
            try {
                const response = await fetch(
                    `${BASE_URL}/users/me/saved/${news.id}`,
                    {
                        headers: {
                            // Get the session token for auth
                            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                        },
                    },
                );
                const data = await response.json();
                setBookmark(data.is_saved); // pre-set bookmark state based on DB
            } catch (err) {
                console.log("Could not check saved status", err);
            }
        };
        checkSaved();
    }, [currentUserId, news.id]);

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

    const { mutate: mu_suspendPost, isPending: isPendingSuspendPost } =
        useMutation({
            mutationFn: async () => {
                const response = await api.delete(`/users/me/news/${news.id}`);
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
        if (!currentUserId) {
            Alert.alert(
                "Error",
                "Could not verify your identity. Please try again.",
            );
            return;
        }
        if (!news.author.localeCompare(user.id)) {
            Alert.alert(
                "Error",
                "You are not authorized to suspend this post.",
            );
            return;
        }
        mu_suspendPost();
    };

    const handleBookmark = async () => {
        console.log("bookmark");
        if (!currentUserId || bookmarkLoading) return;
        setBookmarkLoading(true);

        try {
            // Get auth token
            const token = (await supabase.auth.getSession()).data.session
                ?.access_token;

            if (bookmark) {
                // Already saved → unsave it
                await fetch(`${BASE_URL}/users/me/saved/${news.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBookmark(false);
            } else {
                // Not saved → save it
                await fetch(`${BASE_URL}/users/me/saved/${news.id}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBookmark(true);
            }
            // Refetch saved posts query so bookmarks page updates
            queryClient.invalidateQueries({ queryKey: ["saved_posts"] });
        } catch (err) {
            Alert.alert(
                "Error",
                "Could not update bookmark. Please try again.",
            );
        } finally {
            setBookmarkLoading(false);
        }
    };

    function handleReportPost() {
        // setMenuVisible(false);
        handleCloseSheet();

        router.push({
            pathname: "/report-post",
            params: {
                post_id: news.id,
                inst_id: inst_id,
            },
        });
    }

    return (
        <View>
            {/* <BottomSheetModalProvider> */}
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
                            // color: "hsl(0, 0%, 5%)",
                            color: Colors[colorScheme].text,
                        }}
                    >
                        {timeAgo(news.created_at)}
                    </ThemedText>
                    <Pressable
                        style={{ marginLeft: "auto" }}
                        onPress={handleExpandSheet}
                        // onPress={() => setMenuVisible(true)}
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
                        onPress={() => handleBookmark()}
                        disabled={bookmarkLoading}
                    >
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

            {/* Bottom sheet — shows options when 3 dots is tapped */}
            <BottomSheetModal
                ref={bottomSheetRef}
                onChange={handleSheetChanges}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
            >
                <BottomSheetView
                    style={[
                        styles.bottomSheet,
                        { paddingBottom: bottomSafeArea + 28 },
                    ]}
                >
                    <Pressable style={styles.menuItem}>
                        <Feather
                            name="bookmark"
                            size={20}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText
                            type="defaultSemiBold"
                            style={{ color: Colors[colorScheme].text }}
                        >
                            Save to bookmarks
                        </ThemedText>
                    </Pressable>

                    <Pressable style={styles.menuItem}>
                        <Feather
                            name="user-plus"
                            size={20}
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
                        style={styles.menuItem}
                        onPress={handleReportPost}
                    >
                        <Feather
                            name="alert-circle"
                            size={20}
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
                    {currentUserId === news.author_id && (
                        <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                                bottomSheetRef.current?.close();
                                setSuspendModalVisible(true); // show confirmation modal
                            }}
                        >
                            <Feather
                                name="x-circle"
                                size={20}
                                color={Colors[colorScheme].alert_red}
                            />
                            <ThemedText
                                type="defaultSemiBold"
                                style={{ color: Colors[colorScheme].alert_red }}
                            >
                                Suspend news post
                            </ThemedText>
                        </Pressable>
                    )}
                </BottomSheetView>
            </BottomSheetModal>

            {/* Confirmation modal */}
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
                            <Pressable
                                style={[
                                    styles.modalBtn,
                                    { flex: 1, backgroundColor: "red" },
                                ]}
                                onPress={handleSuspend}
                                disabled={suspending}
                            >
                                <ThemedText
                                    style={{
                                        color: "#fff",
                                        textAlign: "center",
                                    }}
                                >
                                    {suspending ? "Suspending..." : "Suspend"}
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* </BottomSheetModalProvider> */}
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

    bottomSheet: {
        flex: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 24,
    },
    bottomSheetOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalCard: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        gap: 16,
    },
    modalBtn: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        // paddingVertical: 10,
    },
    menuText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#111111",
    },
});

export default NewsPostCard;
