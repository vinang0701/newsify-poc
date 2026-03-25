import {
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
    Image,
    View,
    ScrollView,
    Modal,
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
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedText } from "@/components/themed-text";
import { Community, News } from "@/data/types";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import NewsPostCard from "@/components/news_post_card";
import axios, { AxiosError } from "axios";
import Loading from "@/components/loading";

const HEADER_HEIGHT = 250;

export default function CommunityPage() {
    const colorScheme = useColorScheme() ?? "light";
    const { communityId } = useLocalSearchParams();
    const router = useRouter();
    const snapPoints = useMemo(() => ["20%"], []);
    const [modalVisible, setModalVisible] = useState(false);

    const tenantId = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";
    // ref
    const bottomSheetRef = useRef<BottomSheet>(null);

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

    async function fetchCommunity(): Promise<Community[]> {
        try {
            const response = await axios.get<Community[]>(
                `http://10.0.2.2:8000/api/v1/${tenantId}/communities/${communityId}`,
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

    async function fetchCommunityNews(tenantId: string): Promise<News[]> {
        console.log("fetching in community");
        try {
            const response = await axios.get<News[]>(
                `http://10.0.2.2:8000/api/v1/${tenantId}/news/feed`,
            );
            // Axios throws on non-2xx status codes by default,
            // so a simple return is usually enough.
            return response.data;
        } catch (error) {
            // Re-throwing the error allows TanStack Query to "see" the failure
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    // Fetch data from server
    const { isFetching, status, data, error } = useQuery({
        queryKey: ["community_news", tenantId],
        queryFn: () => fetchCommunityNews(tenantId),
    });

    const {
        isFetching: commFetching,
        status: commStatus,
        data: commData,
        error: commError,
    } = useQuery({
        queryKey: ["community", communityId],
        queryFn: () => fetchCommunity(),
    });

    if (isFetching) {
        return <Loading />;
    }

    if (commData === undefined || commError) {
        return (
            <View>
                <Text>Error</Text>
            </View>
        );
    }

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
                style={{ backgroundColor: Colors[colorScheme].bg }}
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
                                    {nameToAvatar(commData[0].name)[0]}
                                    {nameToAvatar(commData[0].name)[1]}
                                </ThemedText>
                            </View>
                            {/* Community name and Member Count */}
                            <View>
                                <ThemedText type="defaultSemiBold">
                                    {/* Chess Club */}
                                    {commData[0]?.name}
                                </ThemedText>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    30k members
                                </ThemedText>
                            </View>
                        </View>
                        {/* Join Button */}
                        <Pressable onPress={() => setModalVisible(true)}>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].button_text,
                                    backgroundColor: Colors[colorScheme].tint,
                                    paddingVertical: 4,
                                    paddingHorizontal: 12,
                                    borderRadius: 20,
                                }}
                            >
                                Join
                            </ThemedText>
                        </Pressable>
                    </View>
                    <ThemedText
                        type="caption"
                        style={{
                            color: Colors[colorScheme].caption,
                        }}
                    >
                        {commData[0]?.description}
                    </ThemedText>
                </View>

                <View
                    style={{
                        backgroundColor: Colors[colorScheme].bg,
                        paddingHorizontal: 16,
                    }}
                >
                    <View
                        style={[
                            styles.sortButtonContainer,
                            {
                                borderColor: Colors[colorScheme].border,
                                backgroundColor: Colors[colorScheme].bg_light,
                            },
                        ]}
                    >
                        <ThemedText>Sort</ThemedText>
                        <MaterialCommunityIcons
                            name="chevron-down"
                            size={16}
                            color={Colors[colorScheme].text}
                        />
                    </View>
                    <View>
                        <FlashList
                            nestedScrollEnabled={false}
                            data={data}
                            renderItem={({ item, index }) => (
                                <NewsPostCard news={item} key={index} />
                            )}
                        />
                    </View>
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
    header: {
        height: HEADER_HEIGHT,
        overflow: "hidden",
    },
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
    card: {
        flex: 1,
        gap: 8,
        alignContent: "flex-start",
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 4,
        minHeight: 200,
    },
    cardInfoContainer: {
        flex: 1,
        gap: 8,
        marginBottom: 4,
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 12,
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
        marginVertical: 12,
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
