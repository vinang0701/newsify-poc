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
import CommentsModal from "@/components/comments_modal";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";

import { usePreferences } from "@/hooks/usePreferences";


const HEADER_HEIGHT = 250;

const DATA = [
    {
        id: "1",
        title: "Recent",
    },
    {
        id: "2",
        title: "Important",
    },

    {
        id: "3",
        title: "For You"
    },
];

// Substack like news feed
// avatar, name, time ago, 3 dots on the right
// title, image, preview text, read more
// like, comment, repost, save

export default function HomeScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const [activeFilter, setActiveFilter] = useState("Recent");
    const snapPoints = useMemo(() => ["100%"], []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [refreshing, setRefreshing] = React.useState(false);

    // Controls whether the preferences modal is visible
    const [showPrefsModal, setShowPrefsModal] = useState(false);

    // Tracks which step the user is on inside the modal
    // "include" (Pick Interests), "exclude" (What to exclude)
    const [modalStep, setModalStep] = useState<"include" | "exclude">("include");

    // Stores the include category ids selected
    // We need to hold onto them while user goes to
    const [includeIds, setIncludeIds] = useState<string[]>([]);

    // Stores the exclude category ids selected 
    const [excludeIds, setExcludeIds] = useState<string[]>([]);

    // Tracks if we are currently saving to DB
    const [savingPrefs, setSavingPrefs] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        console.log("refetching");
        refetch();
        refetchPersonalised();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    // Testing
    const { status, data, error, isFetching, refetch } = useQuery<News[]>({
        queryKey: ["news"],
        queryFn: async (): Promise<News[]> => {
            const response = await fetch(
                "http://10.0.2.2:8000/api/v1/391848ae-e6c6-43ec-a34c-e6ce06f0d842/news/feed",
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return await response.json();
        },
    });

    // Get the currently logged in user from Supabase auth
    const { data: currentUser } = useQuery({
        queryKey: ["current_user"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        },
    });

    // Fetch personalised posts — only runs once we have the user's id
    const { data: personalisedData, refetch: refetchPersonalised } = useQuery<News[]>({
        queryKey: ["personalised_news", currentUser?.id],
        queryFn: async (): Promise<News[]> => {
            const response = await fetch(
                `http://10.0.2.2:8000/api/v1/391848ae-e6c6-43ec-a34c-e6ce06f0d842/news/feed/personalised?user_id=${currentUser?.id}`
            );
            if (!response.ok) throw new Error("Network response was not ok");
            return await response.json();
        },
        enabled: !!currentUser?.id, // only fetch once we have the user id
    });

    const handleSheetChange = (index: number) => {
        if (index === -1) {
            navigation.getParent()?.setOptions({
                tabBarVisible: false,
            });
        }
    };

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

            const { data } = await supabase
                .from("user_preferences")
                .select("category_id")
                .eq("user_id", currentUser.id)
                .limit(1); // only need to know if at least one exists

            if (!data || data.length === 0) {
                // No preferences found → first time user → show modal
                setShowPrefsModal(true);
            }
        };
        checkPreferences();
    }, 
    
    [currentUser?.id]); // re-run when we get the user id

    // Called when user taps Save on Step 2
    const handleSavePreferences = async () => {
        if (!currentUser?.id) return;
        setSavingPrefs(true);

        try {
            // Delete any existing preferences first
            await supabase
                .from("user_preferences")
                .delete()
                .eq("user_id", currentUser.id);

            // Build rows for include and exclude
            const includeRows = includeIds.map((category_id) => ({
                user_id: currentUser.id,
                category_id,
                preference_type: "include",
            }));

            const excludeRows = excludeIds.map((category_id) => ({
                user_id: currentUser.id,
                category_id,
                preference_type: "exclude",
            }));

            // Insert both lists together
            await supabase
                .from("user_preferences")
                .insert([...includeRows, ...excludeRows]);

            // Close the modal
            setShowPrefsModal(false);

        } catch (err) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setSavingPrefs(false);
        }
    };

    // Pull categories from the hook — we reuse this for both steps of the modal
    const { categories } = usePreferences();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
                        data={DATA}
                        renderItem={({ item }) => (
                            <Pressable
                                style={{
                                    backgroundColor:
                                        activeFilter === item.title
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
                                    if (activeFilter === item.title) {
                                        return;
                                    } else {
                                        setActiveFilter(item.title);
                                    }
                                }}
                            >
                                <ThemedText
                                    type="body_small"
                                    emphasized={true}
                                    style={{
                                        color:
                                            activeFilter === item.title
                                                ? Colors[colorScheme]
                                                      .button_text
                                                : Colors[colorScheme].tint,
                                    }}
                                >
                                    {item.title}
                                </ThemedText>
                            </Pressable>
                        )}
                    />
                    {activeFilter === "Recent" ? (
                        // Shows all institution posts, newest first
                        <View style={{ paddingBottom: insets.bottom + 20 }}>
                            <FlashList
                                style={{ marginBottom: 16 }}
                                data={data}
                                renderItem={({ item }) => (
                                    <NewsPostCard news={item} key={item.id} currentUserId={currentUser?.id} />
                                )}
                            />
                        </View>
                    ) : activeFilter === "Important" ? (
                        // Hardcoded important posts
                        <View style={{ paddingBottom: insets.bottom + 20 }}>
                            <View style={[styles.card, { backgroundColor: Colors[colorScheme].bg_light, borderColor: Colors[colorScheme].border }]}>
                                <View style={styles.cardInfoContainer}>
                                    <Pressable>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                            <Image source={require("@/assets/images/profile.png")} style={{ width: 28, height: 28 }} />
                                            <ThemedText type="defaultSemiBold">SIM Office</ThemedText>
                                        </View>
                                    </Pressable>
                                    <ThemedText type="default" style={{ fontSize: 10, color: "hsl(0, 0%, 5%)" }}>1d</ThemedText>
                                </View>
                                <View>
                                    <Image
                                        alt="image"
                                        source={{ uri: "https://westfield.dorset.sch.uk/wp-content/uploads/2018/12/School-closed.jpg" }}
                                        style={{ width: "100%", height: 200, resizeMode: "contain" }}
                                    />
                                    <ThemedText type="sub_heading" style={{ paddingTop: 12, paddingHorizontal: 12, fontSize: 20 }}>
                                        School closure due to haze from 30th March 2026.
                                    </ThemedText>
                                    <ThemedText style={{ paddingVertical: 4, paddingHorizontal: 12, fontSize: 14 }}>
                                        Please be advised that all physical campus operations at [Your Institution Name] will be suspended starting Monday, 30th March 2026, until further notice. This decision follows the National Environment Agency (NEA) health advisory regarding the current PSI levels. Stay safe and keep your windows closed. We will provide a status update on March 31st at 6:00 PM.
                                    </ThemedText>
                                </View>
                            </View>
                            <View style={[styles.card, { backgroundColor: Colors[colorScheme].bg_light, borderColor: Colors[colorScheme].border }]}>
                                <View style={styles.cardInfoContainer}>
                                    <Pressable>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                            <Image source={require("@/assets/images/profile.png")} style={{ width: 28, height: 28 }} />
                                            <ThemedText type="defaultSemiBold">SIM IT</ThemedText>
                                        </View>
                                    </Pressable>
                                    <ThemedText type="default" style={{ fontSize: 10, color: "hsl(0, 0%, 5%)" }}>3d</ThemedText>
                                </View>
                                <View>
                                    <Image
                                        alt="image"
                                        source={{ uri: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/scam-alert-poster-design-template-54d411d404bbaff0b9b060eb1c0e0ab9_screen.jpg?ts=1682506517" }}
                                        style={{ width: "100%", height: 200, resizeMode: "cover" }}
                                    />
                                    <ThemedText type="sub_heading" style={{ paddingTop: 12, paddingHorizontal: 12, fontSize: 20 }}>
                                        Beware of online scams!
                                    </ThemedText>
                                    <ThemedText style={{ paddingVertical: 4, paddingHorizontal: 12, fontSize: 14 }}>
                                        There has been a recent influx of scams in Singapore. We have received multiple reports of scam emails, in which the threat actor attempt to trick students by asking them to pay their school fees.
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    ) : (
                        // "For You" — shows posts filtered by user's saved preferences
                        <View style={{ paddingBottom: insets.bottom + 20 }}>
                            {!currentUser?.id ? (
                                <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
                                    Please log in to see personalised news.
                                </ThemedText>
                            ) : personalisedData?.length === 0 ? (
                                <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
                                    No posts match your interests yet. Try setting your preferences in your profile!
                                </ThemedText>
                            ) : (
                                <FlashList
                                    style={{ marginBottom: 16 }}
                                    data={personalisedData}
                                    renderItem={({ item }) => (
                                        <NewsPostCard news={item} key={item.id} currentUserId={currentUser?.id} />
                                    )}
                                />
                            )}
                        </View>
                    )}
                </ScrollView>
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    backdropComponent={renderBackdrop}
                    snapPoints={snapPoints}
                    enablePanDownToClose
                    topInset={insets.top}
                    onChange={handleSheetChange}
                >
                    <CommentsModal />
                </BottomSheet>
                {/* First-time preferences modal */}
                <Modal
                    visible={showPrefsModal}
                    animationType="slide"      // slides up from bottom
                    transparent={true}         // background is see-through
                    onRequestClose={() => {}}  // empty — we don't want back button to close it
                >
                    {/* Dark overlay behind the modal */}
                    <View style={styles.modalOverlay}>
                        {/* White card that contains the content */}
                        <View style={[styles.modalCard, { backgroundColor: Colors[colorScheme].bg_light }]}>

                            {modalStep === "include" ? (
                                // ── STEP 1 ── Pick Your Interests
                                <>
                                    <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                                        Pick Your Interests
                                    </ThemedText>
                                    <ThemedText style={styles.modalSubtitle}>
                                        Choose what will appear on your news feed!
                                    </ThemedText>

                                    {/* Category chips */}
                                    <ScrollView contentContainerStyle={styles.modalGrid}>
                                        <View style={styles.grid}>
                                            {categories.map((cat) => (
                                                <TouchableOpacity
                                                    key={cat.category_id}
                                                    style={[
                                                        styles.chip,
                                                        {
                                                            borderColor: Colors[colorScheme].tint,
                                                            backgroundColor: includeIds.includes(cat.category_id)
                                                                ? Colors[colorScheme].tint
                                                                : "transparent",
                                                        },
                                                    ]}
                                                    onPress={() => {
                                                        // Toggle include selection
                                                        setIncludeIds((prev) =>
                                                            prev.includes(cat.category_id)
                                                                ? prev.filter((c) => c !== cat.category_id)
                                                                : [...prev, cat.category_id]
                                                        );
                                                    }}
                                                >
                                                    <ThemedText
                                                        style={{
                                                            color: includeIds.includes(cat.category_id)
                                                                ? Colors[colorScheme].button_text
                                                                : Colors[colorScheme].text,
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
                                        style={[styles.modalBtn, { backgroundColor: Colors[colorScheme].tint }]}
                                        onPress={() => setModalStep("exclude")} // move to step 2
                                        disabled={includeIds.length === 0}      // must select at least one
                                    >
                                        <ThemedText style={{ color: Colors[colorScheme].button_text }}>
                                            Next
                                        </ThemedText>
                                    </Pressable>
                                </>
                            ) : (
                                // ── STEP 2 ── What You Don't Want To See
                                <>
                                    <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                                        What You Don't Want To See
                                    </ThemedText>
                                    <ThemedText style={styles.modalSubtitle}>
                                        Choose what you do not want to appear on your news feed!
                                    </ThemedText>

                                    {/* Category chips — excluded ones are grey with strikethrough */}
                                    <ScrollView contentContainerStyle={styles.modalGrid}>
                                        <View style={styles.grid}>
                                            {categories.map((cat) => {
                                                const isExcluded = excludeIds.includes(cat.category_id);
                                                return (
                                                    <TouchableOpacity
                                                        key={cat.category_id}
                                                        style={[
                                                            styles.chip,
                                                            {
                                                                borderColor: isExcluded ? "#888" : Colors[colorScheme].tint,
                                                                backgroundColor: isExcluded ? "#888" : "transparent",
                                                            },
                                                        ]}
                                                        onPress={() => {
                                                            // Toggle exclude selection
                                                            setExcludeIds((prev) =>
                                                                prev.includes(cat.category_id)
                                                                    ? prev.filter((c) => c !== cat.category_id)
                                                                    : [...prev, cat.category_id]
                                                            );
                                                        }}
                                                    >
                                                        <ThemedText
                                                            style={{
                                                                color: isExcluded ? "#fff" : Colors[colorScheme].text,
                                                                textDecorationLine: isExcluded ? "line-through" : "none",
                                                            }}
                                                        >
                                                            {cat.category_name}
                                                        </ThemedText>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>

                                    <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                                        {/* Back button — goes back to Step 1 */}
                                        <Pressable
                                            style={[styles.modalBtn, { flex: 1, backgroundColor: Colors[colorScheme].text }]}
                                            onPress={() => setModalStep("include")}
                                        >
                                            <ThemedText style={{ color: Colors[colorScheme].button_text }}>
                                                Back
                                            </ThemedText>
                                        </Pressable>

                                        {/* Save button — saves everything and closes modal */}
                                        <Pressable
                                            style={[styles.modalBtn, { flex: 1, backgroundColor: savingPrefs ? "#ccc" : Colors[colorScheme].tint }]}
                                            onPress={handleSavePreferences}
                                            disabled={savingPrefs}
                                        >
                                            <ThemedText style={{ color: Colors[colorScheme].button_text }}>
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
        </GestureHandlerRootView>
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
    justifyContent: "flex-end",          // card sticks to bottom like a bottom sheet
    },

    modalCard: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: "80%",                    // takes up 80% of screen height
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
    borderRadius: 20,   // pill shape
    borderWidth: 1.5,
    },

    grid: {
    flexDirection: "row",   // lay chips left to right
    flexWrap: "wrap",       // wrap to next line when row is full
    gap: 10,
    },

});
