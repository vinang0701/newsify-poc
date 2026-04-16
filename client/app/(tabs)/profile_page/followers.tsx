import { useEffect, useState } from "react";
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
import React, { useCallback, useMemo, useRef } from "react";

const BASE_URL = "http://10.0.2.2:8000/api/v1";
const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";
const curr_user_id = "7369b0d7-3ba3-4a28-bfbe-0e7addaf3eec";

export default function FollowerPage() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const snapPoints = useMemo(() => ["20%"], []);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserFollowing | null>(null);
    const queryClient = useQueryClient();
    const { user_id } = useLocalSearchParams();
    const [refreshing, setRefreshing] = React.useState(false);

    async function fetchMyFollowing(): Promise<UserFollowing[]> {
        try {
            const response = await axios.get<UserFollowing[]>(
                `${BASE_URL}/${inst_id}/users/${curr_user_id}/following`,
            );
            console.log(response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    const { data: my_follows, isLoading: load_myFollows, refetch: myFollowRefetch } = useQuery<UserFollowing[]>({
        queryKey: ["my_following", user_id],
        queryFn: () => fetchMyFollowing(),
    });

    async function fetchFollowers(): Promise<UserFollowers[]> {
        try {
            const response = await axios.get<UserFollowers[]>(
                `${BASE_URL}/${inst_id}/users/${user_id}/followers`,
            );
            console.log(response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    const { data: user_followers, isLoading, refetch } = useQuery<UserFollowers[]>({
        queryKey: ["user_followers", user_id],
        queryFn: () => fetchFollowers(),
    });

    const followUser = async (id: string) => {
        try {
            await axios.post(`${BASE_URL}/${inst_id}/users/me/following`, {
                user_id: curr_user_id,
                followed_user_id: id,
            });

            // Refresh the query so the button changes to "Following"
            queryClient.invalidateQueries({ queryKey: ["my_following"] });
        } catch (err) {
            console.error("Follow failed", err);
        }
    };

    const { mutate, isPending } = useMutation({
        mutationFn: followUser,
    });

    async function unfollowUser(target_id: string) {
        console.log("Unfollowing User");
        try {
            const response = await axios.delete(
                `${BASE_URL}/${inst_id}/users/me/following/${target_id}`,
            );

            queryClient.invalidateQueries({ queryKey: ["my_following"] });
        } catch (error) {
            console.error("Failed to unfollow:", error);
        }
    }

    const { mutate: mu_unfollowUser } = useMutation({
        mutationKey: ["my_following"],
        mutationFn: unfollowUser,
        onError: (error) => {
            Alert.alert("Error", "Something went wrong.");
            console.error(error);
        },
    });

    const followingUserIds = React.useMemo(() => {
        return new Set(my_follows?.map((u) => u.followed_user_id) || []);
    }, [my_follows]);

    // This creates a derived list that updates whenever 'data' or 'searchQuery' changes
    const filteredUsers =
        user_followers?.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ?? [];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        console.log("refetching");
        refetch();
        myFollowersRefetch();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

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
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                }}
            >
                {/* Followers header */}
                <View
                    style={{
                        borderBottomWidth: 1,
                        borderColor: Colors[colorScheme].border,
                        paddingVertical: 4,
                    }}
                >
                    <ThemedText type="defaultSemiBold">Followers</ThemedText>
                </View>
                <ScrollView
                    contentContainerStyle={{
                        flex: 1,
                        paddingBottom: insets.bottom + 80,
                    }}
                    showsVerticalScrollIndicator={false}
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
                            {
                                backgroundColor: Colors[colorScheme].bg_dark,
                                paddingHorizontal: 12,
                                borderRadius: 20,
                                marginTop:12,
                                marginBottom: 8,
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
                                {
                                    flex: 1,
                                    borderColor: "transparent",
                                },
                            ]}
                        />
                    </View>
                    {/* Followers List */}
                    {/* show follower list or show no followers found msg */}
                    { !user_followers || user_followers.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{ textAlign: "center" }}>No followers found</Text>
                        </View>
                    ) : (
                        <FlashList
                            data={filteredUsers}
                            renderItem={({ item }) => (
                                // only show follow button if not current user
                                item.follower_user_id !== curr_user_id ? (
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginVertical: 12,
                                        }}
                                    >
                                        <View>
                                            <Pressable
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                                onPress={() => {
                                                    router.push(`/(tabs)/profile_page/${item.follower_user_id}`);
                                                }}
                                            >
                                                <Image
                                                    source={require("@/assets/images/profile.png")}
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        resizeMode: "contain",
                                                    }}
                                                />
                                                <ThemedText type="defaultSemiBold">
                                                    {item.name}
                                                </ThemedText>
                                            </Pressable>
                                        </View>
                                        <Pressable
                                            style={{
                                                paddingVertical: 8,
                                                paddingHorizontal: 12,
                                                backgroundColor:
                                                    followingUserIds.has(item.follower_user_id)
                                                        ? "transparent"
                                                        : Colors[colorScheme]
                                                              .tint,
                                                borderRadius: 20,
                                                borderWidth: 2,
                                                borderColor: followingUserIds.has(
                                                    item.follower_user_id,
                                                )
                                                    ? Colors[colorScheme].tint
                                                    : "transparent",
                                            }}
                                            onPress={() => {
                                                !followingUserIds.has(
                                                    item.follower_user_id,
                                                )
                                                    ? mutate(
                                                        item.follower_user_id,
                                                    )
                                                    : (() => {
                                                        setSelectedUser(item);
                                                        setModalVisible(true);
                                                    })();
                                            }}
                                        >
                                            <ThemedText
                                                type="body_small"
                                                emphasized
                                                style={{
                                                    color: followingUserIds.has(
                                                        item.follower_user_id,
                                                    )
                                                        ? Colors[colorScheme]
                                                              .tint
                                                        : Colors[colorScheme].button_text,

                                                    fontWeight: "semibold",
                                                }}
                                            >
                                                {followingUserIds.has(item.follower_user_id)
                                                    ? "Following"
                                                    : "Follow"}
                                            </ThemedText>
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginVertical: 12,
                                        }}
                                    >
                                        <View>
                                            <Pressable
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                                onPress={() => {
                                                    router.push(`/(tabs)/profile_page/${item.follower_user_id}`);
                                                }}
                                            >
                                                <Image
                                                    source={require("@/assets/images/profile.png")}
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        resizeMode: "contain",
                                                    }}
                                                />
                                                <ThemedText type="defaultSemiBold">
                                                    {item.name}
                                                </ThemedText>
                                            </Pressable>
                                        </View>
                                    </View>
                                )
                            )}
                        />
                    )}
                </ScrollView>
            </View>
            <Modal
                animationType="slide"
                visible={modalVisible}
                backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View
                        style={[
                            styles.modalView,
                            {
                                backgroundColor:
                                    Colors[colorScheme].bg_light,
                            },
                        ]}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={styles.modalText}
                        >
                            Unfollow {selectedUser?.name}?
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
                                    setModalVisible(false)
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
                                            Colors[colorScheme]
                                                .alert_red,
                                    },
                                ]}
                                onPress={() => {
                                    if (!selectedUser) return;
                                    mu_unfollowUser(selectedUser.follower_user_id);
                                    setModalVisible(false);
                                    setSelectedUser(null); // reset selected user
                                }}
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
                                    Unfollow
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flex: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },

    flexRowContainer: {
        flex: 0,
        alignItems: "center",
        flexDirection: "row",
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
    button: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        elevation: 2,
    },
    textStyle: {
        textAlign: "center",
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
});