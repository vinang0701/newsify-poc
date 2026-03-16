import { Image } from "expo-image";
import {
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Platform,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
} from "react-native";
import axios from "axios";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import DraftEditor from "@/components/draft_editor";
import DraftsTab from "@/components/drafts";

type ModerationResponse = {
    content: string;
    flag: boolean;
};

export default function CreatePost() {
    const colorScheme = useColorScheme() ?? "light";
    const [inputValue, setInputValue] = useState("");
    const [moderationResponse, setModerationResponse] =
        useState<ModerationResponse>();
    const [activeFilter, setActiveFilter] = useState("New");
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    const publishPost = async (content: string) => {
        const { data } = await axios.post(
            "http://10.0.2.2:8000/api/v1/users/create",
            {
                email: "vanessa@uow.edu.au",
                content,
            },
        );

        return data;
    };

    const { mutate, isPending, data, error } = useMutation({
        mutationKey: ["moderation"],
        mutationFn: publishPost,

        onSuccess: () => {
            setInputValue("");
            setModalVisible(true);
            console.log(data);
        },

        onError: (err) => {
            console.log("Post failed:", err);
            Alert.alert("Failed to publish post");
        },
    });

    function handlePublish() {
        if (!inputValue.trim()) {
            Alert.alert("Stop it ah");
            return;
        }

        mutate(inputValue);
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={false}
            style={{
                backgroundColor: Colors[colorScheme].bg,
            }}
        >
            <SafeAreaView edges={["top"]}>
                <Header />
            </SafeAreaView>
            {isPending && (
                <Modal
                    animationType="slide"
                    backdropColor={"rgba(0, 0, 0, 0.25)"}
                    visible={isPending}
                >
                    <View style={styles.centeredView}>
                        <ActivityIndicator
                            size="large"
                            color={Colors[colorScheme].tint}
                        />
                    </View>
                </Modal>
            )}

            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                }}
            >
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="sub_heading">Creating a Post</ThemedText>
                </ThemedView>
                {/* Tab navigation */}
                <ThemedView
                    style={{
                        flexDirection: "row",
                        gap: 8,
                    }}
                >
                    <Pressable
                        onPress={() => {
                            setActiveFilter("new");
                        }}
                        style={[
                            {
                                backgroundColor:
                                    activeFilter.toLowerCase() === "new"
                                        ? Colors[colorScheme].tint
                                        : Colors[colorScheme].bg_light,
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderColor: Colors[colorScheme].border,
                                borderWidth: 1,

                                borderRadius: 4,
                            },
                        ]}
                    >
                        <ThemedText
                            type="caption"
                            emphasized
                            style={{
                                color:
                                    activeFilter.toLowerCase() === "new"
                                        ? Colors[colorScheme].button_text
                                        : Colors[colorScheme].tint,
                            }}
                        >
                            New
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            setActiveFilter("drafts");
                        }}
                        style={[
                            {
                                backgroundColor:
                                    activeFilter.toLowerCase() === "drafts"
                                        ? Colors[colorScheme].tint
                                        : Colors[colorScheme].bg_light,
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderColor: Colors[colorScheme].border,
                                borderWidth: 1,
                                borderRadius: 4,
                            },
                        ]}
                    >
                        <ThemedText
                            type="caption"
                            emphasized
                            style={{
                                color:
                                    activeFilter.toLowerCase() === "drafts"
                                        ? Colors[colorScheme].button_text
                                        : Colors[colorScheme].tint,
                            }}
                        >
                            Drafts
                        </ThemedText>
                    </Pressable>
                </ThemedView>
                {activeFilter.toLowerCase() === "new" ? (
                    <DraftEditor />
                ) : (
                    <DraftsTab />
                )}
            </View>
            {data && (
                <Modal
                    animationType="slide"
                    backdropColor={"rgba(0, 0, 0, 0.25)"}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        {!data.flagged ? (
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
                                    style={{
                                        color: Colors[colorScheme].text,
                                    }}
                                >
                                    Success!
                                </ThemedText>
                                <ThemedText
                                    type="body_medium"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    Your news post has passed the checks and is
                                    now published.
                                </ThemedText>
                                <Pressable
                                    style={[
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].text,
                                            width: "100%",
                                            paddingVertical: 8,
                                            borderRadius: 4,
                                        },
                                    ]}
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        router.navigate("/(tabs)");
                                    }}
                                >
                                    <ThemedText
                                        type="body_medium"
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                            fontWeight: "700",
                                        }}
                                    >
                                        Close
                                    </ThemedText>
                                </Pressable>
                            </View>
                        ) : (
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
                                    style={{
                                        fontWeight: 700,
                                        color: Colors[colorScheme].text,
                                    }}
                                >
                                    Failed
                                </ThemedText>
                                <ThemedText
                                    type="body_medium"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    Your news post did not pass the checks.
                                    Please ensure to adhere to our rules and
                                    guidelines.
                                </ThemedText>
                                <Pressable
                                    style={[
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].text,
                                            width: "100%",
                                            paddingVertical: 8,
                                            borderRadius: 4,
                                        },
                                    ]}
                                    onPress={() => {
                                        setModalVisible(!modalVisible);
                                        router.navigate("/(tabs)");
                                    }}
                                >
                                    <ThemedText
                                        type="body_medium"
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                            fontWeight: "700",
                                        }}
                                    >
                                        Close
                                    </ThemedText>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </Modal>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    modalView: {
        borderWidth: 1,
        width: "100%",
        margin: 16,
        borderRadius: 8,
        gap: 8,
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
});
