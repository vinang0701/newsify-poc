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
    Alert,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { useCommunity } from "@/hooks/useCommunity";
import Loading from "@/components/loading";

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

interface UserCommunities {
    community_id: string;
    community_name: string;
    role: string;
}

const BASE_URL = "http://10.0.2.2:8000/api/v1";
// const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";
// const user_id = "4813d507-9b97-4bb7-bee4-39ec47070889";

export default function CommunitiesTab() {
    const colorScheme = useColorScheme() ?? "light";
    const [comm, setComm] = useState<Community[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [refreshing, setRefreshing] = React.useState(false);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { session, metadata } = useAuthStore();
    const inst_id = metadata?.inst_id;
    const user_id = metadata?.user_id;
    // console.log(session?.access_token);

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

    const joinComm = async (id: string) => {
        try {
            await api.post(`/users/me/communities`, {
                community_id: id,
                user_id: user_id,
            });

            // Refresh the query so the button changes to "Leave"
            queryClient.invalidateQueries({ queryKey: ["user_communities"] });
        } catch (err) {
            console.error("Join failed", err);
        }
    };

    const { mutate, isPending } = useMutation({
        mutationFn: joinComm,
    });

    const getAvatarColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Generate a color using HSL for better control over "vibrancy"
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 60%, 50%)`; // 60% saturation, 50% lightness
    };

    const { data, error, isFetching, refetch } = useQuery<Community[]>({
        queryKey: ["communities"],
        queryFn: async (): Promise<Community[]> => {
            const response = await api(`/${inst_id}/communities`, {
                params: {
                    search: searchQuery || undefined, // Don't send empty strings
                },
            });

            return response.data;
        },
        enabled:
            !!inst_id && (searchQuery.length === 0 || searchQuery.length > 2),
    });

    const {
        data: comm_mem_data,
        error: comm_mem_error,
        refetch: comm_mem_refetch,
        isFetching: isFetchingCommMem,
    } = useQuery<UserCommunities[]>({
        queryKey: ["user_communities", user_id],
        queryFn: async () => {
            // axios try catch
            const response = await api.get(`/users/me/communities`);

            return response.data;
        },
    });

    async function leaveCommunity(community_id: string) {
        console.log("Leaving community");
        try {
            const response = await api.delete(
                `/users/me/communities/${community_id}`,
            );

            queryClient.invalidateQueries({ queryKey: ["user_communities"] });
            return response.data;
        } catch (error) {
            console.error("Failed to leave:", error);
        }
    }

    const { mutate: mu_leaveCommunity } = useMutation({
        mutationKey: ["user_communities"],
        mutationFn: leaveCommunity,
        onError: (error) => {
            Alert.alert("Error", "Something went wrong.");
            console.error(error);
        },
    });

    const joinedCommunityIds = React.useMemo(() => {
        return new Set(comm_mem_data?.map((c) => c.community_id) || []);
    }, [comm_mem_data]);

    // This creates a derived list that updates whenever 'data' or 'searchQuery' changes
    const filteredCommunities =
        data?.filter((community) =>
            community.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ?? [];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        refetch();
        comm_mem_refetch();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            {(isFetching || isFetchingCommMem) && <Loading />}
            <Header />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
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
                        value={searchQuery}
                        onChangeText={setSearchQuery}
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
                    contentContainerStyle={{
                        height: "100%",
                        marginBottom: 16,
                    }}
                    data={filteredCommunities}
                    ListEmptyComponent={
                        <View
                            style={{
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: "50%",
                            }}
                        >
                            <ThemedText
                                type="sub_heading"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                No communities yet
                            </ThemedText>
                            <ThemedText
                                type="body_medium"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                You can request to create a community.
                            </ThemedText>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <Link
                            href={{
                                pathname: "/community/[communityId]",
                                params: {
                                    communityId: item?.id,
                                    inst_id: inst_id,
                                },
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
                                                20 members
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <Pressable
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 12,
                                            backgroundColor:
                                                joinedCommunityIds.has(item.id)
                                                    ? Colors[colorScheme]
                                                          .alert_red
                                                    : Colors[colorScheme]
                                                          .bg_light,
                                            borderRadius: 20,
                                            borderWidth: 2,
                                            borderColor: joinedCommunityIds.has(
                                                item.id,
                                            )
                                                ? "transparent"
                                                : Colors[colorScheme].tint,
                                        }}
                                        onPress={() => {
                                            !joinedCommunityIds.has(item.id)
                                                ? mutate(item.id)
                                                : mu_leaveCommunity(item.id);
                                        }}
                                    >
                                        <ThemedText
                                            type="body_small"
                                            emphasized
                                            style={{
                                                color: joinedCommunityIds.has(
                                                    item.id,
                                                )
                                                    ? Colors[colorScheme]
                                                          .button_text
                                                    : Colors[colorScheme].tint,

                                                fontWeight: "semibold",
                                            }}
                                        >
                                            {joinedCommunityIds.has(item.id)
                                                ? "Leave"
                                                : "Join"}
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
