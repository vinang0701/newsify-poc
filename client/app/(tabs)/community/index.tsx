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
import { Community } from "@/data/types";
import { Header } from "@/components/header";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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
        <SafeAreaView>
            <Header />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: Colors[colorScheme].bg,
                }}
            >
                <ThemedText
                    style={{ marginBottom: 12, fontSize: 22, fontWeight: 800 }}
                >
                    Communities
                </ThemedText>
                <View>
                    <FlashList
                        keyExtractor={(item) => item.id}
                        horizontal
                        style={{
                            marginBottom: 12,
                        }}
                        data={DATA}
                        renderItem={({ item }) => (
                            <Pressable
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    backgroundColor:
                                        activeFilter === item.title
                                            ? Colors[colorScheme].tint
                                            : Colors[colorScheme].bg,
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
                                <Text
                                    style={{
                                        color:
                                            activeFilter === item.title
                                                ? Colors[colorScheme]
                                                      .button_text
                                                : Colors[colorScheme].text,
                                    }}
                                >
                                    {item.title}
                                </Text>
                            </Pressable>
                        )}
                    />
                </View>
                <View>
                    <FlashList
                        data={comm}
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
                                            <Image
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
                                            />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type="defaultSemiBold">
                                                    {item.name}
                                                </ThemedText>
                                                <ThemedText
                                                    type="caption"
                                                    style={{
                                                        color: Colors[
                                                            colorScheme
                                                        ].text_light,
                                                    }}
                                                >
                                                    {item.member_count}k members
                                                </ThemedText>
                                            </View>
                                        </View>
                                        <Pressable
                                            style={{
                                                paddingVertical: 8,
                                                paddingHorizontal: 12,
                                                backgroundColor: item.joined
                                                    ? Colors[colorScheme]
                                                          .alert_red
                                                    : Colors[colorScheme]
                                                          .bg_light,
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
                                                        : Colors[colorScheme]
                                                              .tint,

                                                    fontWeight: "semibold",
                                                }}
                                            >
                                                {item.joined ? "Leave" : "Join"}
                                            </ThemedText>
                                        </Pressable>
                                    </View>
                                    <ThemedText
                                        type="caption"
                                        style={{
                                            color: Colors[colorScheme].caption,
                                        }}
                                    >
                                        {item.desc}
                                    </ThemedText>
                                </View>
                            </Link>
                        )}
                    />
                </View>
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
});
