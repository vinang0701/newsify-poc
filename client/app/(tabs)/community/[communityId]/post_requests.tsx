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
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useCommunityPostRequests } from "@/hooks/useCommunityPostRequests";

const filterTag = [
    {
        filter: "Pending",
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
    const [activeFilter, setActiveFilter] = useState("Pending");

    const params = useLocalSearchParams<{
        inst_id?: string;
        communityId: string;
    }>();
    const communityId = params.communityId;
    const inst_id = params.inst_id;

    const {
        requests: postRequests,
        loading: postRequestsLoading,
        refreshing: postRequestsRefreshing,
        error: postRequestsError,
        refresh: postRequestsRefresh
    } = useCommunityPostRequests(inst_id, communityId);

    useFocusEffect(
        useCallback(() => {
            postRequestsRefresh();
        }, [])
    );

    const filteredRequests = postRequests.filter((request) => {
        return request.status.toLowerCase() === activeFilter.toLowerCase();
    });

    function goToViewPostRequest(request_id: string) {
        router.push({
            pathname: "/(tabs)/community/[communityId]/view_post_request",
            params: {
                communityId,
                inst_id,
                request_id,
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
                { filteredRequests.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <ThemedText type="body" style={{ textAlign: 'center' }}>
                            No request found
                        </ThemedText>
                    </View>
                ) : (
                    <FlashList
                        showsVerticalScrollIndicator={false}
                        data={filteredRequests}
                        renderItem={({ item }) => (
                        <Pressable
                            onPress={() => {
                                console.log("request_id:", item.request_id, "user_id:", item.author_name);
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
                                        source={item.image_url}
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
                )}
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