import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    useColorScheme,
    Pressable,
    Modal,
    TextInput,
    RefreshControl,
    Alert,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useCommunityPostRequests } from "@/hooks/useCommunityPostRequests";

const testData = [
    {
        id: "1",
        title: "Weekly News",
        description: "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! ",
        thumbnail: require("@/assets/images/android-icon-background.png"),
        author: "Victor Lim",
        created_at: "10/01/2026"
    },
    {
        id: "2",
        title: "Weekly News",
        description: "Here’s what happened in Newsify School this week!",
        thumbnail: require("@/assets/images/android-icon-background.png"),
        author: "Victor Lim",
        created_at: "10/01/2026"
    },
];

const filterTag = [
    {
        filter: "All",
    },
    {
        filter: "Approved",
    },
    {
        filter: "Rejected",
    },
];

export default function PostRequestPage() {
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState("All");

    const params = useLocalSearchParams<{
        inst_id?: string;
        communityId: string;
    }>();
    const communityId = params.communityId;
    const inst_id = params.inst_id;

    const {
        requests,
        loading,
        refreshing,
        error,
        refresh,
    } = useCommunityPostRequests(inst_id, communityId);

    function goToViewPostRequest(request_id: string) {
        router.push({
            pathname: "/(tabs)/community/[communityId]/post_requests",
            params: {
                communityId,
                inst_id,
            }
        });
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View
                style={[
                    styles.headerContainer,
                    {
                        backgroundColor: Colors[colorScheme].tint,
                    },
                ]}
            >
                <Pressable onPress={() => router.back()}>
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].button_text}
                        weight="bold"
                    />
                </Pressable>
            </View>
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                }}
            >
                {/* Requests header */}
                <View
                    style={{
                        borderBottomWidth: 1,
                        borderColor: Colors[colorScheme].border,
                        paddingVertical: 4,
                    }}
                >
                    <ThemedText type="defaultSemiBold">Requests</ThemedText>
                </View>
            </View>
            <View
                style={{
                    flex: 1,
                    paddingHorizontal:16,
                }}
            >
                <FlashList
                    horizontal={true}
                    style={{ marginBottom: 12, elevation: 10 }}
                    data={filterTag}
                    renderItem={({ item }) => (
                        <Pressable
                            style={{
                                backgroundColor:
                                    activeFilter === item.filter
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
                                if (activeFilter === item.filter) {
                                    return;
                                } else {
                                    setActiveFilter(item.filter);
                                }
                            }}
                        >
                            <ThemedText
                                type="body_small"
                                emphasized={true}
                                style={{
                                    color:
                                        activeFilter === item.filter
                                            ? Colors[colorScheme].button_text
                                            : Colors[colorScheme].tint,
                                }}
                            >
                                {item.filter}
                            </ThemedText>
                        </Pressable>
                    )}
                />
                <FlashList
                    showsVerticalScrollIndicator={false}
                    data={requests}
                    renderItem={({ item }) => (
                    <Pressable
                        onPress={() => {
                            console.log("request_id:", item.request_id, "community_id:", item.community_id, "user_id:", item.author_name);
                            goToViewPostRequest(item.request_id);
                        }}
                    >
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor: Colors[colorScheme].bg_light,
                                    borderColor: Colors[colorScheme].border,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.cardInfoContainer,
                                ]}
                            >
                                <Image
                                    alt="image"
                                    source={item.thumbnail}
                                    style={{
                                        borderRadius: 8,
                                        width: 150,
                                        height: "100%",
                                        resizeMode: "cover",
                                    }}
                                />
                                <View
                                    style={{
                                        flexShrink: 1,
                                        justifyContent: "space-between",
                                        gap: 4,
                                    }}>
                                    <ThemedText type="defaultSemiBold">
                                        {item.title}
                                    </ThemedText>
                                    <ThemedText
                                        type="caption"
                                        style={{
                                            color: Colors[colorScheme].caption,
                                        }}
                                        numberOfLines={4}
                                        ellipsizeMode="tail"
                                    >
                                        {item.description}
                                    </ThemedText>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <Image
                                            source={require("@/assets/images/profile.png")}
                                            style={{ width: 26, height: 26 }}
                                        />
                                        <ThemedText type="caption" emphasized>
                                            {item.author_name}
                                        </ThemedText>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: "flex-end",
                                            //alignItems: "flex-end",
                                        }}
                                    >
                                        <ThemedText
                                            type="caption"
                                            style={{
                                                color: Colors[colorScheme].caption,
                                            }}
                                        >
                                            {item.created_at}
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Pressable>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flex: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    card: {
        flex: 1,
        gap: 8,
        alignContent: "flex-start",
        borderRadius: 8,
        borderWidth: 1,
        elevation: 2,
        paddingVertical: 12,
        marginBottom: 8,
        height: 180,
    },
    cardInfoContainer: {
        flex: 1,
        gap: 8,
        marginBottom: 4,
        paddingHorizontal: 12,
        flexDirection: "row",
    },
});