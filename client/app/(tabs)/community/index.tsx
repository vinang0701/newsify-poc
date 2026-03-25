import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import communityData from "@/data/communities.json";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { useEffect, useState } from "react";
import {
    Text,
    Button,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableHighlight,
    useColorScheme,
    View,
    TextInput,
    RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Community } from "@/data/types";
import { Header } from "@/components/header";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 250;

const DATA = [
    {
        id: "1",
        title: "All",
    },
    {
        id: "2",
        title: "Tech",
    },
    {
        id: "3",
        title: "Arts",
    },
    {
        id: "4",
        title: "Lifestyle",
    },
];

export default function CommunitiesTab() {
    const colorScheme = useColorScheme() ?? "light";
    const [comm, setComm] = useState<Community[]>([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const insets = useSafeAreaInsets();
    const router = useRouter();

    function formatMemberCount(count: number) {
        if (count < 1000) {
            return count;
        } else if (count < 1000000) {
            count = Math.round((count /= 1000) * 100) / 100;
            return count;
        } else {
            return count;
        }
    }

    function nameToAvatar(name: string) {
        // 1. Split by whitespace and filter out any empty strings from extra spaces
        // 2. Map to the first character and uppercase it
        const initials = name
            .trim()
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase())
            .filter((char) => /^[A-Z0-9]$/.test(char)); // Ensure it's alphanumeric

        // Grab the first two initials
        const first = initials[0] || "";
        const second = initials[1] || "";

        return [first, second];
    }

    const getAvatarColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Generate a color using HSL for better control over "vibrancy"
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 60%, 50%)`; // 60% saturation, 50% lightness
    };

    const { status, data, error, isFetching, refetch } = useQuery<Community[]>({
        queryKey: ["communities"],
        queryFn: async (): Promise<Community[]> => {
            const response = await fetch(
                "http://10.0.2.2:8000/api/v1/391848ae-e6c6-43ec-a34c-e6ce06f0d842/communities",
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return await response.json();
        },
    });

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        console.log("refetching");
        refetch();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <Header />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    paddingBottom: insets.bottom + 80,
                    backgroundColor: Colors[colorScheme].bg,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View
                    style={[
                        styles.flexRowContainer,
                        { marginBottom: 12, justifyContent: "space-between" },
                    ]}
                >
                    <ThemedText
                        style={{
                            fontSize: 22,
                            fontWeight: 800,
                        }}
                    >
                        Communities
                    </ThemedText>

                    <Pressable
                        style={{
                            backgroundColor: Colors[colorScheme].tint,
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 20,
                        }}
                        onPress={() => {
                            router.navigate("/(tabs)/community/request_form");
                        }}
                    >
                        <ThemedText
                            type="caption"
                            emphasized
                            style={{
                                color: Colors[colorScheme].button_text,
                            }}
                        >
                            Apply
                        </ThemedText>
                    </Pressable>
                </View>
                <View
                    style={[
                        styles.flexRowContainer,
                        {
                            backgroundColor: Colors[colorScheme].bg_dark,
                            paddingHorizontal: 12,
                            borderRadius: 20,
                            marginBottom: 12,
                            gap: 4,
                        },
                    ]}
                >
                    <Feather
                        name="search"
                        size={16}
                        color={Colors[colorScheme].caption}
                    />
                    <TextInput
                        editable
                        numberOfLines={1}
                        placeholder="Search"
                        style={[
                            styles.searchInput,
                            { borderColor: "transparent" },
                        ]}
                    />
                </View>

                <FlashList
                    keyExtractor={(item) => item.id}
                    horizontal={true}
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
                                            ? Colors[colorScheme].button_text
                                            : Colors[colorScheme].tint,
                                }}
                            >
                                {item.title}
                            </ThemedText>
                        </Pressable>
                    )}
                />

                <FlashList
                    style={{ paddingBottom: 16 }}
                    data={data}
                    renderItem={({ item }) => (
                        <Link
                            href={{
                                pathname: "/community/[communityId]",
                                params: { communityId: item?.id },
                            }}
                            style={[
                                styles.card,
                                {
                                    borderColor: Colors[colorScheme].border,
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    {
                                        width: "100%",
                                    },
                                ]}
                            >
                                {/* Top info */}
                                {/* Avatar | (Name, Member Count) | Join Button */}
                                <View
                                    style={[
                                        styles.flexRowContainer,
                                        { gap: 8 },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.flexRowContainer,
                                            { gap: 8 },
                                        ]}
                                    >
                                        {/* <Image
                                                source={require("@/assets/images/icon.png")}
                                                style={{
                                                    height: 36,
                                                    width: 36,
                                                    borderRadius: 100,
                                                    borderWidth: 1,
                                                    borderColor:
                                                        Colors[colorScheme]
                                                            .border,
                                                }}
                                            /> */}

                                        <View
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 20,
                                                backgroundColor: getAvatarColor(
                                                    item.name,
                                                ),
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderWidth: 1,
                                                borderColor: "rgba(0,0,0,0.1)", // Subtle border
                                            }}
                                        >
                                            <ThemedText
                                                type="body_medium"
                                                emphasized
                                                style={{
                                                    color: Colors[colorScheme]
                                                        .button_text, // White text usually pops best on colors
                                                }}
                                            >
                                                {nameToAvatar(item.name)[0]}
                                                {nameToAvatar(item.name)[1]}
                                            </ThemedText>
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <ThemedText type="defaultSemiBold">
                                                {item.name}
                                            </ThemedText>
                                            <ThemedText
                                                type="caption"
                                                style={{
                                                    color: Colors[colorScheme]
                                                        .text_light,
                                                }}
                                            >
                                                1k members
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <Pressable
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 12,
                                            backgroundColor: item.joined
                                                ? Colors[colorScheme].alert_red
                                                : Colors[colorScheme].bg_light,
                                            borderRadius: 20,
                                            borderWidth: 2,
                                            borderColor: item.joined
                                                ? "transparent"
                                                : Colors[colorScheme].tint,
                                        }}
                                    >
                                        <ThemedText
                                            type="body_small"
                                            emphasized
                                            style={{
                                                color: item.joined
                                                    ? Colors[colorScheme]
                                                          .button_text
                                                    : Colors[colorScheme].tint,

                                                fontWeight: "semibold",
                                            }}
                                        >
                                            {item.joined ? "Leave" : "Join"}
                                        </ThemedText>
                                    </Pressable>
                                </View>
                                <ThemedText
                                    type="caption"
                                    emphasized
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    {item.description}
                                </ThemedText>
                            </View>
                        </Link>
                    )}
                />
            </ScrollView>
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
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 1,
        elevation: 2,
    },
    cardInfoContainer: {
        flex: 1,
        gap: 8,
        alignItems: "center",
        flexDirection: "row",
    },
    flexRowContainer: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
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
    searchInput: {
        flex: 1,
        borderRadius: 8,
        minHeight: 32,
        maxHeight: 120,
        borderWidth: 1,
        paddingVertical: 4,
        fontSize: 12,
        textAlignVertical: "center",
    },
});
