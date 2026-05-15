import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useColorScheme,
    Alert,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { DraftData, News } from "@/data/types";
import { FlashList } from "@shopify/flash-list";
import { ThemedText } from "./themed-text";
import Feather from "@expo/vector-icons/Feather";
import WebView from "react-native-webview";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useDrafts from "@/hooks/useDrafts";
import Loading from "./loading";
import { useRouter } from "expo-router";

const DraftsTab = ({ draftData }: { draftData: DraftData[] }) => {
    const colorScheme = useColorScheme() ?? "light";
    const insets = useSafeAreaInsets();
    const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
    // Bottom Sheet
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const handleExpandSheet = useCallback((draft_id: string) => {
        setSelectedDraftId(draft_id);
        bottomSheetRef?.current?.present();
    }, []);
    const router = useRouter();
    const { queryClient, mu_deleteDraft, isPendingDeleteDraft } = useDrafts();

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

    const handleDeleteDraft = (draft_id: string) => {
        mu_deleteDraft(draft_id, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["drafts"] });
            },
        });
    };

    const handleEditDraft = () => {
        if (selectedDraftId === null || selectedDraftId === "") {
            Alert.alert("Error", "You are not able to edit this draft.");
            return;
        }
        bottomSheetRef.current?.dismiss();
        router.push({
            pathname: "/(tabs)/create/edit_draft",
            params: { draft_id: selectedDraftId },
        });
    };

    return (
        <View style={{ flex: 1 }}>
            {isPendingDeleteDraft && <Loading />}
            <FlashList
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={false}
                data={draftData}
                contentContainerStyle={{ flexGrow: 1 }}
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
                            style={{ color: Colors[colorScheme].text }}
                        >
                            No drafts found
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            emphasized
                            style={{ color: Colors[colorScheme].caption }}
                        >
                            Start by crafting your news post first.
                        </ThemedText>
                    </View>
                }
                renderItem={({ item }) => {
                    return (
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
                                <Pressable
                                    style={{ marginLeft: "auto" }}
                                    onPress={() =>
                                        handleExpandSheet(
                                            item.draft_id as string,
                                        )
                                    }
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
                                {item.thumbnail ? (
                                    <Image
                                        alt="image"
                                        source={{
                                            uri: item.thumbnail,
                                        }}
                                        style={{
                                            width: "100%",
                                            height: 200,
                                            resizeMode: "cover",
                                        }}
                                    />
                                ) : (
                                    <View
                                        style={{
                                            width: "100%",
                                            height: 200,
                                            backgroundColor:
                                                Colors[colorScheme].bg_dark,
                                        }}
                                    ></View>
                                )}
                                <ThemedText
                                    type="sub_heading"
                                    style={{
                                        paddingTop: 12,
                                        paddingHorizontal: 12,
                                        fontSize: 20,
                                    }}
                                >
                                    {item.title}
                                </ThemedText>
                                {/* <ThemedText
                                    style={{
                                        paddingVertical: 4,
                                        paddingHorizontal: 12,
                                        fontSize: 14,
                                    }}
                                >
                                    {item.content}
                                </ThemedText> */}
                                <WebView
                                    originWhitelist={["*"]}
                                    source={{
                                        html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${item.content}</body></html>`,
                                    }}
                                    style={{ height: 200 }}
                                />
                            </View>
                        </View>
                    );
                }}
            />
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
                    <Pressable
                        style={styles.menuItem}
                        onPress={handleEditDraft}
                    >
                        <Feather
                            name="edit"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">
                            Edit draft
                        </ThemedText>
                    </Pressable>

                    <Pressable
                        style={styles.menuItem}
                        onPress={() => {
                            if (selectedDraftId) {
                                handleDeleteDraft(selectedDraftId);
                                bottomSheetRef.current?.dismiss();
                            }
                        }}
                    >
                        <Feather
                            name="x-circle"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">
                            Suspend draft
                        </ThemedText>
                    </Pressable>
                </BottomSheetView>
            </BottomSheetModal>
        </View>
    );
};

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
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 24,
    },
    menuItem: {
        flex: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});

export default DraftsTab;
