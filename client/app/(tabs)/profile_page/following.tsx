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
const curr_user_id = "4813d507-9b97-4bb7-bee4-39ec47070889";

export default function FollowingPage() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const snapPoints = useMemo(() => ["20%"], []);
    //const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
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

    async function fetchFollowing(): Promise<UserFollowing[]> {
        try {
            const response = await axios.get<UserFollowing[]>(
                `${BASE_URL}/${inst_id}/users/${user_id}/following`,
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

    const { data: user_follows, isLoading, refetch } = useQuery<UserFollowing[]>({
        queryKey: ["user_following", user_id],
        queryFn: () => fetchFollowing(),
    });

    const followUser = async (id: string) => {
        try {
            await axios.post(`${BASE_URL}/${inst_id}/users/me/following`, {
                user_id: curr_user_id,
                followed_user_id: id,
            });

            // Refresh the query so the button changes to "Following"
            queryClient.invalidateQueries({ queryKey: ["my_following", user_id] });
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

            queryClient.invalidateQueries({ queryKey: ["my_following", user_id] });
        } catch (error) {
            console.error("Failed to unfollow:", error);
        }
    }

    const { mutate: mu_unfollowUser } = useMutation({
        mutationKey: ["user_following"],
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
        user_follows?.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
            //user.followed_user_id !== user_id,
        ) ?? [];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        console.log("refetching");
        refetch();
        myFollowRefetch();
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
                {/* Following header */}
                <View
                    style={{
                        borderBottomWidth: 1,
                        borderColor: Colors[colorScheme].border,
                        paddingVertical: 4,
                    }}
                >
                    <ThemedText type="defaultSemiBold">Following</ThemedText>
                </View>
                <ScrollView
                    contentContainerStyle={{
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
                    {/* Following List */}
                    {/* show following list or show no following found msg */}
                    { !user_follows || user_follows.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{ textAlign: "center" }}>No following found</Text>
                        </View>
                    ) : (
                        // only show follow button if not current user
                        <FlashList
                            data={filteredUsers}
                            renderItem={({ item }) => (
                                item.followed_user_id !== curr_user_id ? (
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
                                                    router.push(`/(tabs)/profile_page/${item.followed_user_id}`);
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
                                                    followingUserIds.has(item.followed_user_id)
                                                        ? "transparent"
                                                        : Colors[colorScheme]
                                                              .tint,
                                                borderRadius: 20,
                                                borderWidth: 2,
                                                borderColor: followingUserIds.has(
                                                    item.followed_user_id,
                                                )
                                                    ? Colors[colorScheme].tint
                                                    : "transparent",
                                            }}
                                            onPress={() => {
                                                !followingUserIds.has(item.followed_user_id)
                                                    ? mutate(item.followed_user_id)
                                                    : Alert.alert(
                                                        "Unfollow user",
                                                        `Do you want to unfollow ${item.name}?`,
                                                        [
                                                            {
                                                                text: "Cancel",
                                                                onPress: () => console.log("Cancel Pressed"),
                                                                style: "cancel",
                                                            },
                                                            {
                                                                text: "Unfollow",
                                                                style: "destructive",
                                                                onPress: () => {
                                                                    mu_unfollowUser(item.followed_user_id);
                                                                },
                                                            },
                                                        ]
                                                    );
                                            }}
                                        >
                                            <ThemedText
                                                type="body_small"
                                                emphasized
                                                style={{
                                                    color: followingUserIds.has(
                                                        item.followed_user_id,
                                                    )
                                                        ? Colors[colorScheme]
                                                              .tint
                                                        : Colors[colorScheme].button_text,

                                                    fontWeight: "semibold",
                                                }}
                                            >
                                                {followingUserIds.has(item.followed_user_id)
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
                                                    router.push(`/(tabs)/profile_page/${item.followed_user_id}`);
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
        </SafeAreaView>
    );
};

//export default FollowingPage;

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
    }
});