// components/news_post_bottom_sheet.tsx
import React, { forwardRef, RefObject, useCallback, useEffect } from "react";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { View, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    newsAuthorId: string;
    userId: string;
    colorScheme: "light" | "dark";
    onReport: () => void;
    onSuspend: () => void;
};

const NewsPostBottomSheet = forwardRef<BottomSheetModal, Props>(
    ({ newsAuthorId, userId, colorScheme, onReport, onSuspend }, ref) => {
        const insets = useSafeAreaInsets();
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

        return (
            <BottomSheetModal
                ref={ref}
                backdropComponent={renderBackdrop}
                enablePanDownToClose={true}
                enableDynamicSizing
            >
                <BottomSheetView
                    style={[
                        styles.bottomSheet,
                        { paddingBottom: insets.bottom + 28 },
                    ]}
                >
                    {newsAuthorId !== userId && (
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
                    )}

                    {newsAuthorId !== userId && (
                        <Pressable style={styles.menuItem} onPress={onReport}>
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
                    )}
                    {/* Only show suspend option if this is the user's own post */}
                    {newsAuthorId === userId && (
                        <Pressable style={styles.menuItem} onPress={onSuspend}>
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
        );
    },
);

const styles = StyleSheet.create({
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

export default NewsPostBottomSheet;
