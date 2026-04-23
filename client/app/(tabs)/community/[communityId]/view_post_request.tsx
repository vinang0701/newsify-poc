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
import { PostRequest } from "@/data/types";

const BASE_URL = "http://10.0.2.2:8000/api/v1";
const FALLBACK_INST_ID = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

const testData = [
    {
        id: "1",
        title: "Weekly News",
        description: "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
            "Here’s what happened in Newsify School this week! " +
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

type PostRequestCardProps = {
    request: PostRequest;
};

export default function ViewPostRequestPage({ request }: PostRequestCardProps) {
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState("All");
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);

    const params = useLocalSearchParams<{
        user_id?: string;
        inst_id?: string;
        community_id: string;
    }>();

    const user_id = params.user_id ?? "7369b0d7-3ba3-4a28-bfbe-0e7addaf3eec";
    const community_id = params.community_id ?? "96454f8b-d680-4fe9-92ea-04d1df8c5a55";
    const inst_id = params.inst_id ?? FALLBACK_INST_ID;

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
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flex: 1,
                    flexGrow: 1,
                }}>
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: Colors[colorScheme].bg_light,
                            borderColor: Colors[colorScheme].border,
                        },
                    ]}
                >
                    <View style={styles.cardInfoContainer}>
                        <Pressable> {/*onPress={() => handleNavigate(news.author_id)*/}
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 4,
                                }}
                            >
                                <Image
                                    source={require("@/assets/images/profile.png")}
                                    style={{ width: 28, height: 28 }}
                                />
                                <ThemedText type="defaultSemiBold">
                                    {testData[0].author}
                                </ThemedText>
                            </View>
                        </Pressable>
                        {/*<Pressable style={{ marginLeft: "auto" }}>
                            <Feather
                                name="more-vertical"
                                size={20}
                                color={Colors[colorScheme].icon}
                            />
                        </Pressable> */}
                    </View>
                    <View>
                        {/* Content */}
                        <Image
                            alt="image"
                            source={
                                testData[0].thumbnail
                            }
                            style={{
                                width: "100%",
                                height: 200,
                                resizeMode: "cover",
                            }}
                        />
                        <ThemedText
                            type="sub_heading"
                            style={{
                                paddingTop: 12,
                                paddingHorizontal: 12,
                                fontSize: 20,
                            }}
                        >
                            {testData[0].title}
                        </ThemedText>
                        <ThemedText
                            style={{
                                paddingVertical: 4,
                                paddingHorizontal: 12,
                                fontSize: 14,
                            }}
                        >
                            {testData[0].description}
                        </ThemedText>
                    </View>
                    <View style={[
                            styles.actionButtonsContainer,
                            {
                                paddingHorizontal: 12,
                            }
                        ]}>
                        <Pressable
                            style={ ({ pressed }) => [
                                styles.button,
                                {
                                    backgroundColor: pressed
                                    ? Colors[colorScheme].secondary_dark
                                    : Colors[colorScheme].secondary
                                },
                            ]}
                            onPress={() => setApproveModalVisible(true)}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: Colors[colorScheme].button_text,
                                    textAlign: "center",
                                }}
                            >
                                Approve
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            style={ ({ pressed }) => [
                                styles.button,
                                {
                                    backgroundColor: pressed
                                    ? Colors[colorScheme].alert_red_dark
                                    : Colors[colorScheme].alert_red
                                },
                            ]}
                            onPress={() => setRejectModalVisible(true)}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: Colors[colorScheme].button_text,
                                    textAlign: "center",
                                }}
                            >
                                Reject
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
            {/* Approve Modal */}
            <Modal
                animationType="slide"
                visible={approveModalVisible}
                backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                onRequestClose={() => {
                    setApproveModalVisible(!approveModalVisible);
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
                            Confirm approval?
                        </ThemedText>
                        <ThemedText
                            type="caption"
                            style={[
                                styles.modalText,
                                {
                                    fontSize: 12,
                                }
                            ]}
                        >
                            Are you sure you want to approve this post?
                        </ThemedText>
                        <View style={{ flexDirection: "row", gap: 24 }}>
                            <Pressable
                                style={ ({ pressed }) => [
                                    styles.modalButton,
                                    {
                                        backgroundColor: pressed
                                        ? Colors[colorScheme].caption
                                        : Colors[colorScheme].text
                                    },
                                ]}
                                onPress={() =>
                                    setApproveModalVisible(!approveModalVisible)
                                }
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                        styles.textStyle,
                                        {
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        },
                                    ]}
                                >
                                    Cancel
                                </ThemedText>
                            </Pressable>

                            <Pressable
                                style={ ({ pressed }) => [
                                    styles.modalButton,
                                    {
                                        backgroundColor: pressed
                                        ? Colors[colorScheme].secondary_dark
                                        : Colors[colorScheme].secondary
                                    },
                                ]}
                                //onPress={handleSignOut}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                        styles.textStyle,
                                        {
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        },
                                    ]}
                                >
                                    Approve
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Reject Modal */}
            <Modal
                animationType="slide"
                visible={rejectModalVisible}
                backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                onRequestClose={() => {
                    setRejectModalVisible(!rejectModalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View
                        style={[
                            styles.modalView,
                            {
                                backgroundColor:
                                    Colors[colorScheme].bg_light,
                                height: 250,
                            },
                        ]}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={styles.modalText}
                        >
                            Enter a reason:
                        </ThemedText>
                        <TextInput
                            multiline={true}
                            style={[
                                styles.input,
                                {
                                    textAlignVertical: "top",
                                },
                            ]}
                        />
                        <View style={{ flexDirection: "row", gap: 24 }}>
                            <Pressable
                                style={ ({ pressed }) => [
                                    styles.modalButton,
                                    {
                                        backgroundColor: pressed
                                        ? Colors[colorScheme].caption
                                        : Colors[colorScheme].text
                                    },
                                ]}
                                onPress={() =>
                                    setRejectModalVisible(!rejectModalVisible)
                                }
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                        styles.textStyle,
                                        {
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        },
                                    ]}
                                >
                                    Cancel
                                </ThemedText>
                            </Pressable>

                            <Pressable
                                style={ ({ pressed }) => [
                                    styles.modalButton,
                                    {
                                        backgroundColor: pressed
                                        ? Colors[colorScheme].alert_red_dark
                                        : Colors[colorScheme].alert_red
                                    },
                                ]}
                                //onPress={}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                        styles.textStyle,
                                        {
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        },
                                    ]}
                                >
                                    Reject
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
    card: {
        flex: 1,
        gap: 8,
        alignContent: "flex-start",
        borderRadius: 8,
        borderWidth: 1,
        elevation: 2,
        paddingVertical: 12,
        marginBottom: 24,
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
    button: {
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 87,
    },
    actionButtonsContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    centeredView: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    modalButton: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        elevation: 2,
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
    input: {
        flex: 1,
        //height: "100%",
        width: "100%",
        fontSize: 16,
        backgroundColor: "hsl(0 0% 90%)",
        borderRadius: 8,
        padding: 8,
    },
});