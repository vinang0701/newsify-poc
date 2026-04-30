import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { News } from "@/data/types";
import { FlashList } from "@shopify/flash-list";
import { ThemedText } from "./themed-text";
import Feather from "@expo/vector-icons/Feather";

type Draft = {
    image?: string;
    title?: string;
    content?: string;
};

const DraftsTab = ({ draftData }: { draftData: Draft[] }) => {
    const colorScheme = useColorScheme() ?? "light";

    return (
        <View style={{ flex: 1 }}>
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
                            type="body_small"
                            emphasized
                            style={{ color: Colors[colorScheme].caption }}
                        >
                            No drafts found
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
                                <Pressable style={{ marginLeft: "auto" }}>
                                    <Feather
                                        name="more-vertical"
                                        size={20}
                                        color={Colors[colorScheme].icon}
                                    />
                                </Pressable>
                            </View>
                            <View>
                                {/* Content */}
                                {item.image ? (
                                    <Image
                                        alt="image"
                                        source={{
                                            uri: item.image,
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
                                <ThemedText
                                    style={{
                                        paddingVertical: 4,
                                        paddingHorizontal: 12,
                                        fontSize: 14,
                                    }}
                                >
                                    {item.content}
                                </ThemedText>
                            </View>
                        </View>
                    );
                }}
            />
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
});

export default DraftsTab;
