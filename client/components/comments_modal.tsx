import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import React, { useState } from "react";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Fetch comments

const CommentsModal = () => {
    const colorScheme = useColorScheme() ?? "light";
    const insets = useSafeAreaInsets();
    return (
        <BottomSheetView
            style={[
                styles.bottomSheet,
                {
                    flex: 1,
                    justifyContent: "space-between",
                    backgroundColor: Colors[colorScheme].bg_light,
                    gap: 12,
                },
            ]}
        >
            <ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
                Comments
            </ThemedText>
            <Pressable
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <ThemedText type="caption">Sort</ThemedText>
                <MaterialCommunityIcons name="chevron-down" size={16} />
            </Pressable>
            {/* Comments Container*/}
            <View style={styles.commentsContainer}>
                {/* Comment Node */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                    {/* Image */}
                    <Image
                        source={require("@/assets/images/icon.png")}
                        style={{
                            width: 36,
                            height: 36,
                            resizeMode: "contain",
                            borderWidth: 1,
                            borderColor: Colors[colorScheme].border,
                            borderRadius: 100,
                        }}
                    />
                    {/* Info Container */}
                    <View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <ThemedText type="body_small" emphasized>
                                Priya Doe
                            </ThemedText>
                            <ThemedText type="caption">1d</ThemedText>
                        </View>
                        <ThemedText type="body_small">
                            Can't wait to go!
                        </ThemedText>
                        <Pressable>
                            <ThemedText
                                type="caption"
                                emphasized
                                style={{ color: Colors[colorScheme].caption }}
                            >
                                Reply
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                    {/* Image */}
                    <Image
                        source={require("@/assets/images/icon.png")}
                        style={{
                            width: 36,
                            height: 36,
                            resizeMode: "contain",
                            borderWidth: 1,
                            borderColor: Colors[colorScheme].border,
                            borderRadius: 100,
                        }}
                    />
                    {/* Info Container */}
                    <View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <ThemedText type="body_small" emphasized>
                                John Lee
                            </ThemedText>
                            <ThemedText type="body_small">30m</ThemedText>
                        </View>
                        <ThemedText type="body_small">
                            Are there any animal-related clubs at the fair?
                        </ThemedText>
                        <Pressable>
                            <ThemedText
                                type="caption"
                                emphasized
                                style={{ color: Colors[colorScheme].caption }}
                            >
                                Reply
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                    {/* Image */}
                    <Image
                        source={require("@/assets/images/icon.png")}
                        style={{
                            width: 36,
                            height: 36,
                            resizeMode: "contain",
                            borderWidth: 1,
                            borderColor: Colors[colorScheme].border,
                            borderRadius: 100,
                        }}
                    />
                    {/* Info Container */}
                    <View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <ThemedText type="body_small" emphasized>
                                Zach Ng
                            </ThemedText>
                            <ThemedText type="body_small">3m</ThemedText>
                        </View>
                        <ThemedText type="body_small">
                            Come check out the chess club!
                        </ThemedText>
                        <Pressable>
                            <ThemedText
                                type="caption"
                                emphasized
                                style={{ color: Colors[colorScheme].caption }}
                            >
                                Reply
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>
            <View
                style={[
                    styles.commentInputContainer,
                    { insetBlockEnd: insets.bottom },
                ]}
            >
                <Image
                    source={require("@/assets/images/icon.png")}
                    style={{
                        width: 36,
                        height: 36,
                        resizeMode: "contain",
                        borderWidth: 1,
                        borderColor: Colors[colorScheme].border,
                        borderRadius: 100,
                    }}
                />
                <TextInput
                    editable
                    multiline
                    placeholder="Enter a comment..."
                    style={[
                        styles.commentInput,
                        {
                            borderColor: Colors[colorScheme].text_light,
                        },
                    ]}
                />
            </View>
        </BottomSheetView>
    );
};

export default CommentsModal;

const styles = StyleSheet.create({
    bottomSheet: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 12,
        justifyContent: "space-between",
        height: "100%",
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
    commentsContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
        height: "100%",
    },
    commentInputContainer: {
        gap: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    commentInput: {
        flex: 1,
        borderRadius: 8,
        minHeight: 32,
        maxHeight: 120,
        borderWidth: 1,
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 12,
        textAlignVertical: "center",
    },
});
