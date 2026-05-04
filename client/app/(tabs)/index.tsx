import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import newsArticles from "@/data/news.json";
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
import { Image } from "expo-image";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { usePreferences } from "@/hooks/usePreferences";
import Feather from "@expo/vector-icons/Feather";
const HEADER_HEIGHT = 250;

export default function HomeScreen() {
    const { user, metadata, initialized } = useAuthStore();

    if (!metadata || !user) {
        throw new Error("Error occurred when retrieving user data.");
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
    const { categories, selected, toggleCategory, loading } = usePreferences();
    if (categories === undefined) {
        throw new Error("Error occurred while fetching categories.");
    }

    const [refreshing, setRefreshing] = React.useState(false);

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

    // Get the currently logged in user from Supabase auth
    const { data: currentUser } = useQuery({
        queryKey: ["current_user"],
        queryFn: async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            return user;
        },
    });

    // Fetch personalised posts — only runs once we have the user's id
    const { data: personalisedData, refetch: refetchPersonalised } = useQuery<
        News[]
    >({
        queryKey: ["news"],
        queryFn: async (): Promise<News[]> => {
            const response = await api.get(
                `/${metadata.inst_id}/news/feed/personalised?user_id=${currentUser?.id}`,
            );
            // if (!response.ok) throw new Error("Network response was not ok");
            return await response.data;
        },
        enabled: !!currentUser?.id, // only fetch once we have the user id
    });

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

    // When the screen loads and we have the current user,
    // check if they have any preferences saved
    // If none → show the modal
    useEffect(() => {
        const checkPreferences = async () => {
            if (!currentUser?.id) return;
            if (!loading) {
                const data = selected;

                if (!data || data.length === 0) {
                    // No preferences found → first time user → show modal
                    setShowPrefsModal(true);
                }
            }
        };
        checkPreferences();
    }, [currentUser?.id]); // re-run when we get the user id

    // Called when user taps Save on Step 2
    const handleSavePreferences = async () => {
        if (!currentUser?.id) return;
        try {
            setSavingPrefs(true);

            // Build rows for include and exclude
            const includeRows = includeIds.map((id) => ({
                category_id: id,
                preference_type: "include",
            }));

            const excludeRows = excludeIds.map((id) => ({
                category_id: id,
                preference_type: "exclude",
            }));

            // Insert both lists together
            const combinedPreferences = [...includeRows, ...excludeRows];

            const response = await api.post(
                `/${inst_id}/users/me/preferences`,
                {
                    preferences: combinedPreferences,
                },
            );

            // Close the modal
            setShowPrefsModal(false);
            return response.data;
        } catch (err) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setSavingPrefs(false);
        }
    };

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
                    keyExtractor={(item) => item.id}
                    horizontal
                    style={{ marginBottom: 12, elevation: 10 }}
                    data={categories}
                    renderItem={({ item }) => (
                        <Pressable
                            style={{
                                backgroundColor:
                                    activeFilter === item.category_name
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
                                // Check if active state is pressed
                                if (activeFilter === item.category_name) {
                                    return;
                                } else {
                                    setActiveFilter(item.category_name);
                                }
                            }}
                        >
                            <ThemedText
                                type="body_small"
                                emphasized={true}
                                style={{
                                    color:
                                        activeFilter === item.category_name
                                            ? Colors[colorScheme].button_text
                                            : Colors[colorScheme].tint,
                                }}
                            >
                                {item.category_name}
                            </ThemedText>
                        </Pressable>
                    )}
                />

                {activeFilter === "Recent" ? (
                    <View style={{ paddingBottom: insets.bottom + 20 }}>
                        <FlashList
                            style={{ marginBottom: 16 }}
                            data={personalisedData}
                            renderItem={({ item }) => (
                                <NewsPostCard
                                    news={item}
                                    handleSheetExpand={handleSheetExpand}
                                />
                            )}
                        />
                    </View>
                ) : (
                    <View style={{ paddingBottom: insets.bottom + 20 }}>
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                    borderColor: Colors[colorScheme].border,
                                },
                            ]}
                        >
                            <View style={styles.cardInfoContainer}>
                                <Pressable>
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
                                            style={{
                                                width: 28,
                                                height: 28,
                                            }}
                                        />
                                        <ThemedText type="defaultSemiBold">
                                            SIM Office
                                        </ThemedText>
                                    </View>
                                </Pressable>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].text,
                                    }}
                                >
                                    1d
                                </ThemedText>
                            </View>
                            <View>
                                {/* Content */}
                                <Image
                                    alt="image"
                                    source={{
                                        uri: "https://westfield.dorset.sch.uk/wp-content/uploads/2018/12/School-closed.jpg",
                                    }}
                                    style={{
                                        width: "100%",
                                        height: 200,
                                        resizeMode: "contain",
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
                                    School closure due to haze from 30th March
                                    2026.
                                </ThemedText>
                                <ThemedText
                                    style={{
                                        paddingVertical: 4,
                                        paddingHorizontal: 12,
                                        fontSize: 14,
                                    }}
                                >
                                    Please be advised that all physical campus
                                    operations at [Your Institution Name] will
                                    be suspended starting Monday, 30th March
                                    2026, until further notice. This decision
                                    follows the National Environment Agency
                                    (NEA) health advisory regarding the current
                                    PSI levels. Stay safe and keep your windows
                                    closed. We will provide a status update on
                                    March 31st at 6:00 PM.
                                </ThemedText>
                            </View>
                        </View>
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                    borderColor: Colors[colorScheme].border,
                                },
                            ]}
                        >
                            <View style={styles.cardInfoContainer}>
                                <Pressable>
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
                                            style={{
                                                width: 28,
                                                height: 28,
                                            }}
                                        />
                                        <ThemedText type="defaultSemiBold">
                                            SIM IT
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
                                    3d
                                </ThemedText>
                            </View>
                            <View>
                                {/* Content */}
                                <Image
                                    alt="image"
                                    source={{
                                        uri: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/scam-alert-poster-design-template-54d411d404bbaff0b9b060eb1c0e0ab9_screen.jpg?ts=1682506517",
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
                                    Beware of online scams!
                                </ThemedText>
                                <ThemedText
                                    style={{
                                        paddingVertical: 4,
                                        paddingHorizontal: 12,
                                        fontSize: 14,
                                    }}
                                >
                                    There has been a recent influx of scams in
                                    Singapore. We have received multiple reports
                                    of scam emails, in which the threat actor
                                    attempt to trick students by asking them to
                                    pay their school fees.
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
            {/* BottomSheetModal */}
            <BottomSheetModal
                ref={bottomSheetRef}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
            >
                <BottomSheetView
                    style={[
                        styles.bottomSheet,
                        { paddingBottom: insets.bottom + 28 },
                    ]}
                >
                    <Pressable style={styles.menuItem}>
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
                        style={styles.menuItem}
                        onPress={handleReportPost}
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
                    {newsAuthorId === user.id && (
                        <Pressable
                            style={styles.menuItem}
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
                                style={{ color: Colors[colorScheme].alert_red }}
                            >
                                Suspend news post
                            </ThemedText>
                        </Pressable>
                    )}
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
                    <View
                        style={[
                            styles.modalCard,
                            {
                                backgroundColor: Colors[colorScheme].bg_light,
                            },
                        ]}
                    >
                        {modalStep === "include" ? (
                            // ── STEP 1 ── Pick Your Interests
                            <>
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={styles.modalTitle}
                                >
                                    Pick Your Interests
                                </ThemedText>
                                <ThemedText style={styles.modalSubtitle}>
                                    Choose what will appear on your news feed!
                                </ThemedText>

                                {/* Category chips */}
                                <ScrollView
                                    contentContainerStyle={styles.modalGrid}
                                >
                                    <View style={styles.grid}>
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.category_id}
                                                style={[
                                                    styles.chip,
                                                    {
                                                        borderColor:
                                                            Colors[colorScheme]
                                                                .tint,
                                                        backgroundColor:
                                                            includeIds.includes(
                                                                cat.category_id,
                                                            )
                                                                ? Colors[
                                                                      colorScheme
                                                                  ].tint
                                                                : "transparent",
                                                    },
                                                ]}
                                                onPress={() => {
                                                    // Toggle include selection
                                                    setIncludeIds((prev) =>
                                                        prev.includes(
                                                            cat.category_id,
                                                        )
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
                                                            ? Colors[
                                                                  colorScheme
                                                              ].button_text
                                                            : Colors[
                                                                  colorScheme
                                                              ].text,
                                                    }}
                                                >
                                                    {cat.category_name}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                {/* Next button — goes to Step 2 */}
                                <Pressable
                                    style={[
                                        styles.modalBtn,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].tint,
                                        },
                                    ]}
                                    onPress={() => setModalStep("exclude")} // move to step 2
                                    disabled={includeIds.length === 0} // must select at least one
                                >
                                    <ThemedText
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                        }}
                                    >
                                        Next
                                    </ThemedText>
                                </Pressable>
                            </>
                        ) : (
                            // ── STEP 2 ── What You Don't Want To See
                            <>
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={styles.modalTitle}
                                >
                                    What You Don't Want To See
                                </ThemedText>
                                <ThemedText style={styles.modalSubtitle}>
                                    Choose what you do not want to appear on
                                    your news feed!
                                </ThemedText>

                                {/* Category chips — excluded ones are grey with strikethrough */}
                                <ScrollView
                                    contentContainerStyle={styles.modalGrid}
                                >
                                    <View style={styles.grid}>
                                        {categories.map((cat) => {
                                            const isExcluded =
                                                excludeIds.includes(
                                                    cat.category_id,
                                                );
                                            return (
                                                <TouchableOpacity
                                                    key={cat.category_id}
                                                    style={[
                                                        styles.chip,
                                                        {
                                                            borderColor:
                                                                isExcluded
                                                                    ? "#888"
                                                                    : Colors[
                                                                          colorScheme
                                                                      ].tint,
                                                            backgroundColor:
                                                                isExcluded
                                                                    ? "#888"
                                                                    : "transparent",
                                                        },
                                                    ]}
                                                    onPress={() => {
                                                        // Toggle exclude selection
                                                        setExcludeIds((prev) =>
                                                            prev.includes(
                                                                cat.category_id,
                                                            )
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
                                                            color: isExcluded
                                                                ? "#fff"
                                                                : Colors[
                                                                      colorScheme
                                                                  ].text,
                                                            textDecorationLine:
                                                                isExcluded
                                                                    ? "line-through"
                                                                    : "none",
                                                        }}
                                                    >
                                                        {cat.category_name}
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </ScrollView>

                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 12,
                                        width: "100%",
                                    }}
                                >
                                    {/* Back button — goes back to Step 1 */}
                                    <Pressable
                                        style={[
                                            styles.modalBtn,
                                            {
                                                flex: 1,
                                                backgroundColor:
                                                    Colors[colorScheme].text,
                                            },
                                        ]}
                                        onPress={() => setModalStep("include")}
                                    >
                                        <ThemedText
                                            style={{
                                                color: Colors[colorScheme]
                                                    .button_text,
                                            }}
                                        >
                                            Back
                                        </ThemedText>
                                    </Pressable>

                                    {/* Save button — saves everything and closes modal */}
                                    <Pressable
                                        style={[
                                            styles.modalBtn,
                                            {
                                                flex: 1,
                                                backgroundColor: savingPrefs
                                                    ? "#ccc"
                                                    : Colors[colorScheme].tint,
                                            },
                                        ]}
                                        onPress={handleSavePreferences}
                                        disabled={savingPrefs}
                                    >
                                        <ThemedText
                                            style={{
                                                color: Colors[colorScheme]
                                                    .button_text,
                                            }}
                                        >
                                            {savingPrefs ? "Saving..." : "Save"}
                                        </ThemedText>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </View>
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

    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20, // pill shape
        borderWidth: 1.5,
    },

    grid: {
        flexDirection: "row", // lay chips left to right
        flexWrap: "wrap", // wrap to next line when row is full
        gap: 10,
    },

    // BottomSheet
    bottomSheet: {
        flex: 0,
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
