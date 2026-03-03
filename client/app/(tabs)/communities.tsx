import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import communityData from "@/data/communities.json";
import { Image } from "expo-image";
import { Link } from "expo-router";
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
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Community } from "@/types";

const HEADER_HEIGHT = 250;

const DATA = [
    {
        id: "1",
        title: "All",
    },
    {
        id: "2",
        title: "Sports",
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

export default function communities() {
    const colorScheme = useColorScheme() ?? "light";
    const [comm, setComm] = useState<Community[]>([]);
    const [activeFilter, setActiveFilter] = useState("");

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

    useEffect(() => {
        const fetchData = () => {
            if (!communityData?.communities) return;

            const formattedCommunities = communityData.communities.map(
                (community) => ({
                    id: community.id,
                    name: community.name,
                    desc: community.desc ?? "",
                    member_count:
                        formatMemberCount(community.member_count) ?? 0,
                    category: community.category ?? "",
                    public: community.public ?? false,
                    joined: community.joined ?? false,
                }),
            );

            setComm(formattedCommunities);
        };
        fetchData();
    }, []);
    return (
        <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>
                Communities
            </ThemedText>
            <View>
                <FlashList
                    style={{ marginBottom: 12, elevation: 10 }}
                    data={DATA}
                    renderItem={({ item }) => (
                        <Pressable
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                backgroundColor:
                                    activeFilter === item.title
                                        ? Colors[colorScheme].tint
                                        : Colors[colorScheme].bg_light,
                                marginRight: 8,
                                borderRadius: 4,
                            }}
                            onPress={() => {
                                // Check if active state is pressed
                                if (activeFilter === item.title) {
                                    setActiveFilter("");
                                } else {
                                    setActiveFilter(item.title);
                                }
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        activeFilter === item.title
                                            ? Colors[colorScheme].bg_light
                                            : Colors[colorScheme].tint,
                                }}
                            >
                                {item.title}
                            </Text>
                        </Pressable>
                    )}
                    horizontal
                />
            </View>
            <View>
                <FlashList
                    data={comm}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                },
                            ]}
                        >
                            {/* Top info */}
                            {/* Avatar | (Name, Member Count) | Join Button */}
                            <View
                                style={[
                                    styles.cardInfoContainer,
                                    {
                                        flex: 1,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        {
                                            flex: 1,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 8,
                                        },
                                    ]}
                                >
                                    <Image
                                        source={require("@/assets/images/icon.png")}
                                        style={{
                                            height: 36,
                                            width: 36,
                                            borderRadius: 100,
                                        }}
                                    />
                                    <View>
                                        <ThemedText type="defaultSemiBold">
                                            {item.name}
                                        </ThemedText>
                                        <ThemedText type="caption">
                                            {item.member_count}k members
                                        </ThemedText>
                                    </View>
                                </View>
                                <Pressable
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        backgroundColor: item.joined
                                            ? Colors[colorScheme].secondary_dark
                                            : Colors[colorScheme].tint,
                                        borderRadius: 20,
                                    }}
                                >
                                    <ThemedText
                                        type="caption"
                                        style={{
                                            color: Colors[colorScheme].bg_light,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {item.joined ? "Joined" : "Join"}
                                    </ThemedText>
                                </Pressable>
                            </View>
                            <ThemedText type="caption">{item.desc}</ThemedText>
                        </View>
                    )}
                />
            </View>
        </ScrollView>
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
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        elevation: 4,
    },
    cardInfoContainer: {
        flex: 1,
        gap: 8,
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
});
