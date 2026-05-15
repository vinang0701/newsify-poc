import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
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
    Modal,
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
import Loading from "@/components/loading";

interface ConfirmationState {
    isOpen: boolean;
    communityId: string | null;
    type: "leave" | "remove" | null;
}

export default function UserCommunitiesList() {
    const colorScheme = useColorScheme() ?? "light";
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = React.useState(false);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { user, metadata } = useAuthStore();
    const inst_id = metadata?.inst_id;

    const { user_id } = useLocalSearchParams<{ user_id: string }>();

    const [privateModalVisible, setPrivateModalVisible] = useState(false);
    const [confirmState, setConfirmState] = useState<ConfirmationState>({
        isOpen: false,
        communityId: null,
        type: null,
    });

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

    const getButtonStatus = (item: Community) => {
        if (item.isMember) {
            if (item.member_status === "pending") {
                return "Requested";
            } else {
                return "Leave";
            }
        }

        if (item.public) {
            return "Join";
        }

        return "Request";
    };

    const { data, error, isFetching, refetch } = useQuery<Community[]>({
        queryKey: ["communities"],
        queryFn: async (): Promise<Community[]> => {
            const response = await api(
                `/${metadata?.inst_id}/users/${user_id}/communities`,
                {
                    params: {
                        search: searchQuery || undefined,
                    },
                },
            );

            return response.data;
        },
        enabled:
            !!inst_id && (searchQuery.length === 0 || searchQuery.length > 2),
    });

    // const {
    //     data: myComm,
    //     error: myCommError,
    //     isFetching: isFetchingMyComm,
    //     refetch: refetchMyComm,
    // } = useQuery<Community[]>({
    //     queryKey: ["my_communities"],
    //     queryFn: async (): Promise<Community[]> => {
    //         const response = await api(
    //             `/${metadata?.inst_id}/users/${user?.id}/communities`,
    //         );

    //         return response.data;
    //     },
    //     enabled: !!metadata?.inst_id && !!user?.id,
    // });

    const handleOpenModal = (community: Community) => {
        const actionType =
            community.member_status === "active" ? "leave" : "remove";

        setConfirmState({
            isOpen: true,
            communityId: community.id,
            type: actionType,
        });
    };

    const { mutate: mu_leaveCommunity } = useMutation({
        mutationKey: ["user_communities"],
        mutationFn: async (community_id: string) => {
            const response = await api.delete(
                `/users/me/communities/${community_id}`,
            );

            return response.data;
        },
        onSuccess: () => {
            setConfirmState({
                isOpen: false,
                communityId: null,
                type: null,
            });
            queryClient.invalidateQueries({ queryKey: ["communities"] });
        },
        onError: (error) => {
            Alert.alert("Error", "Something went wrong.");
            console.error(error);
        },
    });

    const handleLeaveCommunity = () => {
        const { communityId } = confirmState;
        if (!communityId || communityId === null) {
            return;
        }

        mu_leaveCommunity(communityId);
    };

    const handleNavigatetoComm = (community: Community) => {
        const isPublic = community.public;
        const isActiveMember =
            community.isMember && community.member_status === "active";
        if (isPublic || isActiveMember) {
            router.push({
                pathname: "/community/[communityId]",
                params: {
                    communityId: community.id,
                    inst_id: inst_id,
                },
            });
            return;
        }

        if (community.member_status === "pending") {
            setPrivateModalVisible(true);
            return;
        }

        setPrivateModalVisible(true);
    };

    // This creates a derived list that updates whenever 'data' or 'searchQuery' changes
    const filteredCommunities =
        data?.filter((community) =>
            community.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ?? [];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        refetch();
        // refetchMyComm();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            {(isFetching || isPending) && <Loading />}
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
                        <Pressable
                            style={[
                                styles.card,
                                {
                                    borderColor: Colors[colorScheme].border,
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                },
                            ]}
                            onPress={() => handleNavigatetoComm(item)}
                        >
                            {/* Top info */}
                            {/* Avatar | (Name, Member Count) | Join Button */}
                            <View style={[styles.flexRowContainer, { gap: 8 }]}>
                                <View
                                    style={[
                                        styles.flexRowContainer,
                                        { gap: 8 },
                                    ]}
                                >
                                    {item.image_url !== null ? (
                                        <Image
                                            source={{ uri: item.image_url }}
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 50,
                                            }}
                                            contentFit="contain"
                                        />
                                    ) : (
                                        <View
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 50,
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
                                    )}

                                    <View style={{ flex: 1 }}>
                                        <ThemedText type="defaultSemiBold">
                                            {item.name}
                                        </ThemedText>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            {item.public ? (
                                                <View
                                                    style={[
                                                        styles.publicBadge,
                                                        {
                                                            backgroundColor:
                                                                Colors[
                                                                    colorScheme
                                                                ].bg_light,
                                                        },
                                                    ]}
                                                >
                                                    <Feather
                                                        name="user"
                                                        size={10}
                                                        color={
                                                            Colors[colorScheme]
                                                                .text
                                                        }
                                                    />
                                                    <ThemedText
                                                        type="caption"
                                                        emphasized
                                                        style={{
                                                            color: Colors[
                                                                colorScheme
                                                            ].text,
                                                        }}
                                                    >
                                                        Public
                                                    </ThemedText>
                                                </View>
                                            ) : (
                                                <View
                                                    style={[
                                                        styles.publicBadge,
                                                        {
                                                            backgroundColor:
                                                                Colors[
                                                                    colorScheme
                                                                ].bg_light,
                                                        },
                                                    ]}
                                                >
                                                    <Feather
                                                        name="lock"
                                                        size={10}
                                                        color={
                                                            Colors[colorScheme]
                                                                .text
                                                        }
                                                    />
                                                    <ThemedText
                                                        type="caption"
                                                        emphasized
                                                        style={{
                                                            color: Colors[
                                                                colorScheme
                                                            ].text,
                                                        }}
                                                    >
                                                        Private
                                                    </ThemedText>
                                                </View>
                                            )}
                                            <ThemedText
                                                type="body_small"
                                                style={{
                                                    color: Colors[colorScheme]
                                                        .text,
                                                }}
                                            >
                                                {item.member_count} members
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                                <Pressable
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        backgroundColor:
                                            getButtonStatus(item) === "Leave"
                                                ? Colors[colorScheme].alert_red
                                                : Colors[colorScheme].bg_light,
                                        borderRadius: 20,
                                        borderWidth: 2,
                                        borderColor:
                                            getButtonStatus(item) === "Leave"
                                                ? "transparent"
                                                : Colors[colorScheme].tint,
                                    }}
                                    onPress={() => {
                                        !item.isMember
                                            ? mutate(item.id)
                                            : handleOpenModal(item);
                                    }}
                                >
                                    <ThemedText
                                        type="body_small"
                                        emphasized
                                        style={{
                                            color:
                                                getButtonStatus(item) ===
                                                "Leave"
                                                    ? Colors[colorScheme]
                                                          .button_text
                                                    : Colors[colorScheme].tint,

                                            fontWeight: "semibold",
                                        }}
                                    >
                                        {getButtonStatus(item)}
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
                        </Pressable>
                    )}
                />
            </ScrollView>
            <Modal
                animationType="slide"
                visible={confirmState.isOpen}
                backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                onRequestClose={() =>
                    setConfirmState({
                        isOpen: false,
                        communityId: null,
                        type: null,
                    })
                }
            >
                <View style={styles.centeredView}>
                    <View
                        style={[
                            styles.modalView,
                            { backgroundColor: Colors[colorScheme].bg_light },
                        ]}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={styles.modalText}
                        >
                            {confirmState.type === "leave"
                                ? "Leave Group?"
                                : "Remove Request?"}
                        </ThemedText>
                        <View style={{ flexDirection: "row", gap: 24 }}>
                            <Pressable
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].text,
                                    },
                                ]}
                                onPress={() =>
                                    setConfirmState({
                                        isOpen: false,
                                        communityId: null,
                                        type: null,
                                    })
                                }
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                        styles.textStyle,
                                        {
                                            color: Colors[colorScheme]
                                                .button_text,
                                        },
                                    ]}
                                >
                                    Cancel
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].alert_red,
                                    },
                                ]}
                                onPress={handleLeaveCommunity}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                        styles.textStyle,
                                        {
                                            color: Colors[colorScheme]
                                                .button_text,
                                        },
                                    ]}
                                >
                                    {confirmState.type === "leave"
                                        ? "Leave"
                                        : "Remove"}
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                visible={privateModalVisible}
                backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                onRequestClose={() => setPrivateModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View
                        style={[
                            styles.modalView,
                            { backgroundColor: Colors[colorScheme].bg_light },
                        ]}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <Feather
                                name="x-octagon"
                                size={20}
                                color={Colors[colorScheme].alert_red}
                            />
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    fontWeight: "bold",
                                    color: Colors[colorScheme].alert_red,
                                }}
                            >
                                Unauthorized
                            </ThemedText>
                        </View>
                        <ThemedText type="body_medium" emphasized>
                            This is a private community. Only approved members
                            can view and contribute.
                        </ThemedText>
                        <View style={{ flexDirection: "row" }}>
                            <Pressable
                                style={{
                                    flex: 1,
                                    paddingVertical: 8,
                                    backgroundColor: Colors[colorScheme].text,
                                    borderRadius: 4,
                                }}
                                onPress={() => setPrivateModalVisible(false)}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                        styles.textStyle,
                                        {
                                            color: Colors[colorScheme]
                                                .button_text,
                                        },
                                    ]}
                                >
                                    Back
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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
    publicBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 2,
        gap: 4,
        borderWidth: 1,
    },
    modalText: {
        fontWeight: "bold",
    },
    centeredView: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
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
    textStyle: {
        textAlign: "center",
    },
    button: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        elevation: 2,
    },
});
