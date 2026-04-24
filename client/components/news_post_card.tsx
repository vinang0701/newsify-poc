import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useColorScheme,
    Alert,
    Modal,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { ThemedText } from "./themed-text";
import { ModalProps, News } from "@/data/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { useRef, useCallback, useMemo } from "react";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

type NewsPostCardProps = {
    news: News;
    currentUserId?: string //if not passed, suspend wont show. need to check if current user is the logged in user to be able to suspend own post
};

function NewsPostCard({ news, currentUserId }: NewsPostCardProps) {
    const colorScheme = useColorScheme() ?? "light";
    const [like, setLike] = useState(false);
    const [bookmark, setBookmark] = useState(false);
    const [likeCount, setLikeCount] = useState(20);
    const router = useRouter();

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["20%"], []);
    const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    const [suspending, setSuspending] = useState(false);

    const handleExpandSheet = () => bottomSheetRef.current?.expand();

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

    function handleNavigate(user_id: string) {
        console.log(user_id);
        router.push({
            pathname: "/(tabs)/profile_page/[user_id]",
            params: { user_id: user_id },
        });
    }

    function handleLike() {
        setLike(!like);
        if (!like) {
            setLikeCount(likeCount + 1);
        } else {
            setLikeCount(20);
        }
    }

    const handleSuspend = async () => {

        // Add this safety check at the very top of handleSuspend:
        if (!currentUserId) {
            Alert.alert("Error", "Could not verify your identity. Please try again.");
            return;
        }

        setSuspending(true);
        try {
            // Update the post status to SUSPENDED in the DB
            const { error } = await supabase
                .from("news_posts")
                .update({ status: "SUSPENDED" })   // change status column
                .eq("id", news.id)                  // only this post
                .eq("author", currentUserId);        // extra safety — only if they are the author

            if (error) throw error;

            // Tell TanStack Query to refetch all these queries automatically
            // This is what causes the feed to refresh without the user doing anything
            queryClient.invalidateQueries({ queryKey: ["news"] }); // "news"  → home feed (index.tsx)
            queryClient.invalidateQueries({ queryKey: ["user_news"] }); // "user_news"  → profile page ([user_id].tsx)
            queryClient.invalidateQueries({ queryKey: ["personalised_news"] }); // "personalised_news" → For You tab (index.tsx)

            setSuspendModalVisible(false);           // close confirmation modal
            bottomSheetRef.current?.close();         // close bottom sheet
            Alert.alert("Post suspended successfully.");
        } catch (err) {
            Alert.alert("Error", "Could not suspend post. Please try again.");
        } finally {
            setSuspending(false);
        }
    };

    return (
        <GestureHandlerRootView>
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
                            color: "hsl(0, 0%, 5%)",
                        }}
                    >
                        1d
                    </ThemedText>
                    <Pressable style={{ marginLeft: "auto" }} onPress={handleExpandSheet}>
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
                        {news.content["text"]?.replace(/\s*\[\+\d+ chars\]$/, "") ||
                            ""}
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
                            onPress={() => handleLike()}
                        >
                            {like ? (
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

                            <ThemedText>{likeCount}</ThemedText>
                        </Pressable>
                        <Link href="/comment" push asChild>
                            <Pressable
                                style={{
                                    flex: 0,
                                    flexDirection: "row",
                                    gap: 4,
                                    justifyContent: "flex-start",
                                    alignItems: "center",
                                }}
                            >
                                <Feather
                                    name="message-square"
                                    size={24}
                                    color="black"
                                />
                                <ThemedText>3</ThemedText>
                            </Pressable>
                        </Link>
                    </View>
                    <Pressable onPress={() => setBookmark(!bookmark)}>
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
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
            >
                <BottomSheetView style={styles.bottomSheet}>
                    {/* Only show suspend option if this is the user's own post */}
                    {currentUserId === news.author_id && (
                        <Pressable
                            style={styles.bottomSheetOption}
                            onPress={() => {
                                bottomSheetRef.current?.close();
                                setSuspendModalVisible(true); // show confirmation modal
                            }}
                        >
                            <Feather name="x-circle" size={24} color="red" />
                            <ThemedText
                                type="defaultSemiBold"
                                style={{ color: "red" }}
                            >
                                Suspend news post
                            </ThemedText>
                        </Pressable>
                    )}
                </BottomSheetView>
            </BottomSheet>

            {/* Confirmation modal */}
            <Modal
                visible={suspendModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSuspendModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: Colors[colorScheme].bg_light }]}>
                        <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                            Suspend News Post?
                        </ThemedText>
                        <ThemedText style={{ opacity: 0.6 }}>
                            Are you sure you want to suspend this news post?
                        </ThemedText>
                        <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                            {/* Cancel button */}
                            <Pressable
                                style={[styles.modalBtn, { flex: 1, backgroundColor: Colors[colorScheme].text }]}
                                onPress={() => setSuspendModalVisible(false)}
                            >
                                <ThemedText style={{ color: Colors[colorScheme].button_text, textAlign: "center" }}>
                                    Cancel
                                </ThemedText>
                            </Pressable>
                            {/* Suspend button */}
                            <Pressable
                                style={[styles.modalBtn, { flex: 1, backgroundColor: "red" }]}
                                onPress={handleSuspend}
                                disabled={suspending}
                            >
                                <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                                    {suspending ? "Suspending..." : "Suspend"}
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </GestureHandlerRootView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
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

});

export default NewsPostCard;
