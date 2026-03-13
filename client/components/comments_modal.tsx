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

// Fetch comments

const CommentsModal = () => {
    const colorScheme = useColorScheme() ?? "light";
    return (
        <BottomSheetView
            style={[
                styles.bottomSheet,
                { backgroundColor: Colors[colorScheme].bg_light },
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
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    gap: 12,
                }}
            >
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
                                Sansa Stark
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
                                Jon Snow
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
                                Jamie Lannister
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
        </BottomSheetView>
    );
};

export default CommentsModal;

const styles = StyleSheet.create({
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
});
