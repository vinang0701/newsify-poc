import {
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Modal,
    TextInput,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import React, { useState } from "react";
import { useCommunityPostRequests } from "@/hooks/useCommunityPostRequests";

export default function ViewPostRequestPage() {
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const params = useLocalSearchParams<{
        inst_id?: string;
        communityId: string;
        request_id: string;
    }>();

    const {
        requests: postRequestDetails,
        loading: postRequestDetailsLoading,
        refreshing: postRequestDetailsRefreshing,
        error: postRequestDetailsError,
        refresh: postRequestDetailsRefresh,
        updatePostRequestStatus,
        postToCommunity,
    } = useCommunityPostRequests(params.inst_id, params.communityId);

    const selectedRequest = postRequestDetails.find(
        (request) => request.request_id === params.request_id,
    );

    const handlePost = async () => {
        try {
            await postToCommunity(selectedRequest.request_id);
        } catch (err) {
            console.error(err);
            alert("Failed to post to community.");
        }
    };

    const handleApprove = async () => {
        try {
            await updatePostRequestStatus(
                selectedRequest.request_id,
                "approved",
            );
            router.back();
        } catch (err) {
            console.error(err);
            alert("Failed to approve post.");
        }
    };

    const handleReject = async (reason: string) => {
        try {
            if (!reason.trim()) {
                return alert("Please enter a rejection reason.");
            }
            await updatePostRequestStatus(
                selectedRequest.request_id,
                "rejected",
                reason.trim(),
            );
            router.back();
        } catch (err) {
            console.error(err);
            alert("Failed to reject post.");
        }
    };

    if (postRequestDetailsLoading) {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ThemedText>Loading post request...</ThemedText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View
                style={[
                    styles.headerContainer,
                    { backgroundColor: Colors[colorScheme].tint },
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
                style={{ paddingHorizontal: 16, paddingVertical: 12 }}
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
                    <View style={styles.cardInfoContainer}>
                        <Pressable>
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
                                    {selectedRequest?.author_name ?? ""}
                                </ThemedText>
                            </View>
                        </Pressable>
                    </View>
                    <View>
                        {selectedRequest?.image_url ? (
                            <Image
                                alt="image"
                                source={{
                                    uri: selectedRequest.image_url as string,
                                }}
                                style={{
                                    width: "100%",
                                    height: 200,
                                    resizeMode: "cover",
                                }}
                            />
                        ) : null}
                        <ThemedText
                            type="sub_heading"
                            style={{
                                paddingTop: 12,
                                paddingHorizontal: 12,
                                fontSize: 20,
                            }}
                        >
                            {selectedRequest?.title ?? ""}
                        </ThemedText>
                        <ThemedText
                            style={{
                                paddingVertical: 4,
                                paddingHorizontal: 12,
                                fontSize: 14,
                            }}
                        >
                            {selectedRequest?.description ?? ""}
                        </ThemedText>
                    </View>
                    <View
                        style={[
                            styles.actionButtonsContainer,
                            { paddingHorizontal: 12 },
                        ]}
                    >
                        {selectedRequest?.status === "pending" && (
                            <>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.button,
                                        {
                                            backgroundColor: pressed
                                                ? Colors[colorScheme]
                                                      .secondary_dark
                                                : Colors[colorScheme].secondary,
                                        },
                                    ]}
                                    onPress={() => setApproveModalVisible(true)}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        }}
                                    >
                                        Approve
                                    </ThemedText>
                                </Pressable>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.button,
                                        {
                                            backgroundColor: pressed
                                                ? Colors[colorScheme]
                                                      .alert_red_dark
                                                : Colors[colorScheme].alert_red,
                                        },
                                    ]}
                                    onPress={() => setRejectModalVisible(true)}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        }}
                                    >
                                        Reject
                                    </ThemedText>
                                </Pressable>
                            </>
                        )}

                        {selectedRequest?.status === "approved" && (
                            <>
                                <View
                                    style={{
                                        flexDirection: "column",
                                        width: "100%",
                                    }}
                                >
                                    <View
                                        style={{
                                            height: 1,
                                            backgroundColor:
                                                Colors[colorScheme].border,
                                            marginBottom: 8,
                                        }}
                                    />
                                    <View
                                        style={{
                                            flexDirection: "column",
                                            paddingBottom: 8,
                                            justifyContent: "space-between",
                                            gap: 4,
                                        }}
                                    >
                                        <ThemedText
                                            type="caption"
                                            style={{ fontSize: 14 }}
                                        >
                                            Reviewed by:{" "}
                                            {selectedRequest.reviewed_by}
                                        </ThemedText>
                                        <ThemedText
                                            type="caption"
                                            style={{ fontSize: 14 }}
                                        >
                                            Reviewed at:{" "}
                                            {selectedRequest.reviewed_at}
                                        </ThemedText>
                                    </View>
                                </View>
                            </>
                        )}

                        {selectedRequest?.status === "rejected" && (
                            <>
                                <View
                                    style={{
                                        flexDirection: "column",
                                        width: "100%",
                                    }}
                                >
                                    <View
                                        style={{
                                            height: 1,
                                            backgroundColor:
                                                Colors[colorScheme].border,
                                            marginBottom: 8,
                                        }}
                                    />
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{
                                            paddingBottom: 4,
                                        }}
                                    >
                                        Rejection reason:
                                    </ThemedText>
                                    {/* show rejection reason */}
                                    <View
                                        style={{
                                            flex: 1,
                                            backgroundColor: "hsl(0,0%,90%)",
                                            borderRadius: 8,
                                            padding: 12,
                                            marginBottom: 16,
                                        }}
                                    >
                                        <ThemedText
                                            type="caption"
                                            style={{
                                                fontSize: 14,
                                            }}
                                        >
                                            {selectedRequest.rejection_reason ??
                                                ""}
                                        </ThemedText>
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: "column",
                                            paddingBottom: 8,
                                            justifyContent: "space-between",
                                            gap: 4,
                                        }}
                                    >
                                        <ThemedText
                                            type="caption"
                                            style={{ fontSize: 14 }}
                                        >
                                            Reviewed by:{" "}
                                            {selectedRequest.reviewed_by}
                                        </ThemedText>
                                        <ThemedText
                                            type="caption"
                                            style={{ fontSize: 14 }}
                                        >
                                            Reviewed at:{" "}
                                            {selectedRequest.reviewed_at}
                                        </ThemedText>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Approve Modal */}
            <Modal
                animationType="slide"
                visible={approveModalVisible}
                onRequestClose={() =>
                    setApproveModalVisible(!approveModalVisible)
                }
                backdropColor={"hsla(0, 0%, 50%, 0.1)"}
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
                            Confirm Approval
                        </ThemedText>
                        <ThemedText
                            type="caption"
                            style={[styles.modalText, { fontSize: 12 }]}
                        >
                            Are you sure you want to approve this post?
                        </ThemedText>
                        <View style={{ flexDirection: "row", gap: 24 }}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    {
                                        backgroundColor: pressed
                                            ? Colors[colorScheme].caption
                                            : Colors[colorScheme].text,
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
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    {
                                        backgroundColor: pressed
                                            ? Colors[colorScheme].secondary_dark
                                            : Colors[colorScheme].secondary,
                                    },
                                ]}
                                onPress={async () => {
                                    await handleApprove();
                                    await handlePost();
                                }}
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
                onRequestClose={() =>
                    setRejectModalVisible(!rejectModalVisible)
                }
                backdropColor={"hsla(0, 0%, 50%, 0.1)"}
            >
                <View style={styles.centeredView}>
                    <View
                        style={[
                            styles.modalView,
                            {
                                backgroundColor: Colors[colorScheme].bg_light,
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
                            multiline
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            style={[styles.input, { textAlignVertical: "top" }]}
                        />
                        <View style={{ flexDirection: "row", gap: 24 }}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    {
                                        backgroundColor: pressed
                                            ? Colors[colorScheme].caption
                                            : Colors[colorScheme].text,
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
                                disabled={rejectionReason.length === 0}
                                style={({ pressed }) => [
                                    styles.modalButton,
                                    {
                                        backgroundColor: pressed
                                            ? Colors[colorScheme].alert_red_dark
                                            : Colors[colorScheme].alert_red,
                                        opacity:
                                            rejectionReason.length == 0
                                                ? 0.5
                                                : 1,
                                    },
                                ]}
                                onPress={() => handleReject(rejectionReason)}
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
        width: "100%",
        fontSize: 16,
        backgroundColor: "hsl(0 0% 90%)",
        borderRadius: 8,
        padding: 8,
    },
});
