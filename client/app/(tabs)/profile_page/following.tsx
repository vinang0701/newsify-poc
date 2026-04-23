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
import { useUserFollowing, UserFollowing } from "@/hooks/useUserFollowing";

export default function FollowingPage() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? "light";
    const { user_id } = useLocalSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserFollowing | null>(null);

    const {
        following,
        myFollowing,
        followingUserIds,
        loading,
        refreshing,
        error,
        refresh,
        followUser,
        unfollowUser,
        currentUserId,
    } = useUserFollowing(user_id as string);

    // This creates a derived list that updates whenever 'data' or 'searchQuery' changes
    const filteredUsers = useMemo(() => {
        return following.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [following, searchQuery]);

    const handleFollow = async (id: string) => {
        try {
            await followUser(id);
        } catch (err: any) {
            console.log("Failed to follow: " + err.message);
        }
    };

    const handleUnfollow = async () => {
        if (!selectedUser) return;

        try {
            await unfollowUser(selectedUser.followed_user_id);
            setModalVisible(false);
            setSelectedUser(null);  // unselect user
        } catch (err: any) {
            console.log("Failed to unfollow: " + err.message)
        }
    };

    const onRefresh = React.useCallback(() => {
        refresh();
    }, [refresh]);

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
                                marginTop: 12,
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
                    { filteredUsers.length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ textAlign: "center" }}>
                                No following found
                            </Text>
                        </View>
                    ) : (
                        <FlashList
                            data={filteredUsers}
                            renderItem={({ item }) =>
                                // only show follow button if not current user
                                item.followed_user_id !== currentUserId ? (
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
                                                    router.push(
                                                        `/(tabs)/profile_page/${item.followed_user_id}`,
                                                    );
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
                                                    followingUserIds.has(
                                                        item.followed_user_id,
                                                    )
                                                        ? "transparent"
                                                        : Colors[colorScheme]
                                                              .tint,
                                                borderRadius: 20,
                                                borderWidth: 2,
                                                borderColor:
                                                    followingUserIds.has(
                                                        item.followed_user_id,
                                                    )
                                                        ? Colors[colorScheme]
                                                              .tint
                                                        : "transparent",
                                            }}
                                            onPress={() => {
                                                followingUserIds.has(
                                                    item.followed_user_id,
                                                )
                                                    ? (() => {
                                                        setSelectedUser(item);
                                                        setModalVisible(true);
                                                    }) ()
                                                    : handleFollow(item.followed_user_id)
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
                                                        : Colors[colorScheme]
                                                              .button_text,

                                                    fontWeight: "semibold",
                                                }}
                                            >
                                                {followingUserIds.has(
                                                    item.followed_user_id,
                                                )
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
                                                    router.push(
                                                        `/(tabs)/profile_page/${item.followed_user_id}`,
                                                    );
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
                            }
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
                                onPress={handleUnfollow}
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
