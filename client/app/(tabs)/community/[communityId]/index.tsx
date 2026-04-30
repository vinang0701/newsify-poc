import {
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
    Image,
    View,
    ScrollView,
    Modal,
    ActivityIndicator,
    Alert,
} from "react-native";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Colors } from "@/constants/theme";
import {
    Link,
    useLocalSearchParams,
    useRouter,
    useFocusEffect,
} from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedText } from "@/components/themed-text";
import { Community, News } from "@/data/types";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NewsPostCard from "@/components/news_post_card";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import Loading from "@/components/loading";
import { useCommunity } from "@/hooks/useCommunity";

export default function CommunityPage() {
    const colorScheme = useColorScheme() ?? "light";
    const params = useLocalSearchParams<{
        inst_id?: string;
        communityId: string;
    }>();
    const communityId = params.communityId;
    const inst_id = params?.inst_id;
    const router = useRouter();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["25%"], []);
    const [modalVisible, setModalVisible] = useState(false);
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [selectedSort, setSelectedSort] = useState<
        "Newest" | "Oldest" | "A - Z" | "Z - A"
    >("Newest");

    const {
        community,
        news,
        memberCount,
        myCommunities,
        myCommunityIds,
        isMember,
        userRole,
        joinCommunity,
        leaveCommunity,
        refresh,
        loading,
        currentUserId,
    } = useCommunity(communityId);

    const sortedNews = useMemo(() => {
        if (!news) return [];

        const sorted = [...news];

        switch (selectedSort) {
            case "Newest":
                sorted.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                );
                break;
            case "Oldest":
                sorted.sort(
                    (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime(),
                );
                break;
            case "A - Z":
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "Z - A":
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }

        return sorted;
    }, [news, selectedSort]);

    const handleExpandSheet = () => bottomSheetRef.current?.expand();
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        ),
        [],
    );

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, []),
    );

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

    const handleJoinCommunity = async () => {
        try {
            await joinCommunity();
            console.log("Joined community successfully");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to join the community.");
        }
    };

    const handleLeaveCommunity = async () => {
        try {
            await leaveCommunity();
            console.log("Left community successfully");
            setModalVisible(false);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to leave the community.");
        }
    };

    if (loading && !community) return <Loading />;

    return (
        <GestureHandlerRootView>
            {/* Header */}
            <SafeAreaView>
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

                    <Image
                        source={require("@/assets/images/icon_light.png")}
                        style={{ width: 42, height: 20, resizeMode: "contain" }}
                    />

                    <Pressable onPress={handleExpandSheet}>
                        <MaterialCommunityIcons
                            name="dots-vertical"
                            size={24}
                            color={Colors[colorScheme].button_text}
                        />
                    </Pressable>
                </View>
            </SafeAreaView>
            {/* Content Container */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    backgroundColor: Colors[colorScheme].bg,
                }}
            >
                {/* Community Info */}
                <View
                    style={{
                        backgroundColor: Colors[colorScheme].bg_light,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        gap: 8,
                    }}
                >
                    <View
                        style={[
                            styles.flexRowContainer,
                            {
                                justifyContent: "space-between",
                            },
                        ]}
                    >
                        <View style={styles.flexRowContainer}>
                            {/* <Image
                                source={require("@/assets/images/icon.png")}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderWidth: 1,
                                    borderColor: Colors[colorScheme].border,
                                    borderRadius: 100,
                                }}
                            /> */}
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 20,
                                    backgroundColor: "hsl(54, 81%, 43%)",
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
                                        color: Colors[colorScheme].button_text, // White text usually pops best on colors
                                    }}
                                >
                                    {nameToAvatar(community?.name ?? "")[0]}
                                    {nameToAvatar(community?.name ?? "")[1]}
                                </ThemedText>
                            </View>
                            {/* Community name and Member Count */}
                            <Link
                                href={{
                                    pathname:
                                        "/community/[communityId]/members",
                                    params: { communityId: communityId },
                                }}
                            >
                                <View>
                                    <ThemedText type="defaultSemiBold">
                                        {/* Chess Club */}
                                        {community?.name ?? ""}
                                    </ThemedText>
                                    <ThemedText
                                        type="caption"
                                        style={{
                                            color: Colors[colorScheme].caption,
                                        }}
                                    >
                                        {memberCount} members
                                    </ThemedText>
                                </View>
                            </Link>
                        </View>
                        {/* Join Button */}
                        <Pressable
                            style={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                backgroundColor: isMember
                                    ? Colors[colorScheme].alert_red
                                    : Colors[colorScheme].bg_light,
                                borderRadius: 20,
                                borderWidth: 2,
                                borderColor: isMember
                                    ? "transparent"
                                    : Colors[colorScheme].tint,
                            }}
                            onPress={
                                isMember
                                    ? () => setModalVisible(true)
                                    : handleJoinCommunity
                            }
                        >
                            <ThemedText
                                type="body_small"
                                emphasized
                                style={{
                                    color: isMember
                                        ? Colors[colorScheme].button_text
                                        : Colors[colorScheme].tint,

                                    fontWeight: "semibold",
                                }}
                            >
                                {isMember ? "Leave" : "Join"}
                            </ThemedText>
                        </Pressable>
                    </View>
                    <ThemedText
                        type="caption"
                        style={{
                            color: Colors[colorScheme].caption,
                        }}
                    >
                        {community?.description}
                    </ThemedText>
                </View>

                <View
                    style={{
                        backgroundColor: Colors[colorScheme].bg,
                        paddingHorizontal: 16,
                    }}
                >
                    <Pressable
                        style={[
                            styles.sortButtonContainer,
                            {
                                borderColor: Colors[colorScheme].border,
                                backgroundColor: Colors[colorScheme].bg_light,
                            },
                        ]}
                        onPress={() => setSortMenuVisible(!sortMenuVisible)}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={{ fontSize: 12 }}
                        >
                            Sort
                        </ThemedText>
                        <MaterialCommunityIcons
                            name="chevron-down"
                            size={16}
                            color={Colors[colorScheme].text}
                        />
                    </Pressable>
                    {sortMenuVisible && (
                        <View
                            style={[
                                styles.dropdownMenu,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                },
                            ]}
                        >
                            {["Newest", "Oldest", "A - Z", "Z - A"].map(
                                (option) => (
                                    <Pressable
                                        key={option}
                                        onPress={() => {
                                            setSelectedSort(
                                                option as typeof selectedSort,
                                            );
                                            setSortMenuVisible(false);
                                        }}
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 4,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <ThemedText
                                            type="defaultSemiBold"
                                            style={{
                                                fontWeight:
                                                    selectedSort === option
                                                        ? "bold"
                                                        : "normal",
                                                color: Colors[colorScheme].text,
                                            }}
                                        >
                                            {option}
                                        </ThemedText>

                                        {/* Show check icon if option is selected */}
                                        {selectedSort === option && (
                                            <MaterialCommunityIcons
                                                name="check-bold"
                                                size={20}
                                                color={Colors[colorScheme].text}
                                            />
                                        )}
                                    </Pressable>
                                ),
                            )}
                        </View>
                    )}
                    {news?.length === 0 ? (
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <ThemedText
                                style={{ color: Colors[colorScheme].caption }}
                            >
                                No results found!
                            </ThemedText>
                        </View>
                    ) : (
                        <View>
                            <FlashList
                                nestedScrollEnabled={false}
                                data={sortedNews}
                                renderItem={({ item, index }) => (
                                    <NewsPostCard
                                        news={item}
                                        inst_id={inst_id as string}
                                        key={index}
                                    />
                                )}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
            >
                <BottomSheetView style={styles.bottomSheet}>
                    {userRole === "admin" && (
                        <Pressable
                            style={styles.modalActionButtonCtn}
                            onPress={() => {
                                bottomSheetRef.current?.close();
                                router.push({
                                    pathname:
                                        "/community/[communityId]/post_requests",
                                    params: {
                                        communityId: communityId,
                                        inst_id: inst_id,
                                    },
                                });
                            }}
                        >
                            <Feather
                                name="file-text"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                            <ThemedText type="defaultSemiBold">
                                View post requests
                            </ThemedText>
                        </Pressable>
                    )}
                    <Pressable style={styles.modalActionButtonCtn}>
                        <MaterialCommunityIcons
                            name="help-circle-outline"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">About</ThemedText>
                    </Pressable>
                    <Pressable style={styles.modalActionButtonCtn}>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">Report</ThemedText>
                    </Pressable>
                    <Pressable style={styles.modalActionButtonCtn}>
                        <MaterialCommunityIcons
                            name="plus"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">Join</ThemedText>
                    </Pressable>
                </BottomSheetView>
            </BottomSheet>
            {/* Join/Leave button Action*/}
            <Modal
                animationType="slide"
                visible={modalVisible}
                backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
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
                            Leave group?
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
                                onPress={() => setModalVisible(!modalVisible)}
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
                                    Leave
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView>
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
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    bottomSheet: {
        flex: 0,
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 24,
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
    sortButtonContainer: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        marginVertical: 8,
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
    dropdownMenu: {
        position: "absolute",
        top: 42,
        left: 16,
        width: 180,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
    },
});
