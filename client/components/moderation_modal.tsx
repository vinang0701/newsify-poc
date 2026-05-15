import React from "react";
import {
    Modal,
    View,
    Pressable,
    StyleSheet,
    ScrollView,
    useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";

export interface ModerationData {
    status: string;
    score: string; // e.g., "82%"
    is_flagged: boolean;
    flagged_categories: string[];
}

interface Props {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    data: ModerationData | null;
}

export const ModerationModal = ({ visible, setVisible, data }: Props) => {
    const colorScheme = useColorScheme() ?? "light";
    if (!data) return null;
    const router = useRouter();

    // Determine color based on your specific logic
    const scoreValue = parseInt(data.score);
    const statusColor =
        scoreValue >= 90
            ? Colors[colorScheme].secondary
            : scoreValue >= 85
              ? "#EAB308" // Amber/Yellow for Pending
              : Colors[colorScheme].alert_red;

    return (
        <Modal
            animationType="slide"
            backdropColor={"hsla(0, 0%, 50%, 0.1)"}
            visible={visible}
            onRequestClose={() => setVisible(false)}
        >
            <View style={styles.centeredView}>
                <View
                    style={[
                        styles.modalView,
                        { backgroundColor: Colors[colorScheme].bg_light },
                    ]}
                >
                    {/* Header & Score */}
                    <View
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <ThemedText type="sub_heading" style={styles.modalText}>
                            Publish Status
                        </ThemedText>
                        <ThemedText
                            type="defaultSemiBold"
                            style={{
                                color: Colors[colorScheme].secondary_dark,
                            }}
                        >
                            {data.status}
                        </ThemedText>
                    </View>

                    <View
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={{
                                color: Colors[colorScheme].text,
                            }}
                        >
                            Moderation Score
                        </ThemedText>
                        <View
                            style={[
                                styles.scoreBadge,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                    borderColor: statusColor,
                                    justifyContent: "center",
                                },
                            ]}
                        >
                            <ThemedText
                                type="sub_heading"
                                style={{
                                    color: Colors[colorScheme].text,
                                    textAlignVertical: "center",
                                }}
                            >
                                {data.score}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Flagged Details Section */}
                    {data.is_flagged && (
                        <View
                            style={[
                                styles.flaggedSection,
                                { backgroundColor: Colors[colorScheme].bg },
                            ]}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: Colors[colorScheme].alert_red,
                                }}
                            >
                                Issues Detected:
                            </ThemedText>
                            <ScrollView style={{ maxHeight: 150 }}>
                                {data.flagged_categories.map((item, index) => (
                                    <View
                                        key={index}
                                        style={styles.categoryRow}
                                    >
                                        <ThemedText style={styles.categoryName}>
                                            {item}
                                        </ThemedText>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[
                                styles.button,
                                {
                                    backgroundColor: Colors[colorScheme].text,
                                },
                            ]}
                            onPress={() => {
                                setVisible(false);
                                router.dismissAll();
                                router.replace("/(tabs)");
                            }}
                        >
                            <ThemedText
                                type="defaultSemiBold"
                                style={{
                                    color: Colors[colorScheme].button_text,
                                    textAlign: "center",
                                }}
                            >
                                Close
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        width: "70%",
        gap: 24,
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        textAlign: "center",
    },
    scoreBadge: {
        width: 80,
        height: 80,
        borderRadius: 200,
        borderWidth: 8,
        alignItems: "center",
    },
    flaggedSection: {
        width: "100%",
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    categoryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    categoryName: {
        fontSize: 14,
        textTransform: "capitalize",
    },
    categoryScore: {
        fontSize: 14,
        fontWeight: "bold",
    },
    buttonContainer: {
        width: "100%",
        flexDirection: "row",
        gap: 12,
    },
    button: {
        width: "100%",
        borderRadius: 10,
        padding: 12,
        paddingHorizontal: 20,
        elevation: 2,
    },
});
