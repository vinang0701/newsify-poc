import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { reportPost } from "@/hooks/useReportPost";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

const REPORT_REASONS = [
    "Spam",
    "Hate, Abuse, or Harassment",
    "Violent Speech",
    "Graphic or Violent Media",
    "False Information",
    "Bullying",
    "Sexual Content",
];

export default function ReportPostScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? "light";

    const { post_id, inst_id } = useLocalSearchParams<{
        post_id?: string;
        inst_id?: string;
    }>();

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!post_id) {
            Alert.alert("Error", "Post ID is missing.");
            return;
        }

        if (!inst_id) {
            Alert.alert("Error", "Institution ID is missing.");
            return;
        }

        if (!selectedReason) {
            Alert.alert(
                "Select a reason",
                "Please select a report reason first.",
            );
            return;
        }

        try {
            setSubmitting(true);

            await reportPost(inst_id, post_id, selectedReason);

            Alert.alert(
                "Report submitted",
                "Thank you for helping keep the platform safe.",
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ],
            );
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to report post");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].bg_light}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <ThemedText
                    type="sub_heading"
                    style={{
                        color: Colors[colorScheme].text,
                        paddingBottom: 16,
                        borderBottomWidth: 1,
                        borderColor: Colors[colorScheme].border,
                    }}
                >
                    Report Post
                </ThemedText>

                <ThemedText
                    type="body_medium"
                    style={{ color: Colors[colorScheme].text_light }}
                >
                    Please select the category that best describes your issue
                </ThemedText>

                <View style={styles.reasonList}>
                    {REPORT_REASONS.map((reason) => {
                        const selected = selectedReason === reason;

                        return (
                            <Pressable
                                key={reason}
                                style={styles.reasonRow}
                                onPress={() => setSelectedReason(reason)}
                            >
                                <ThemedText
                                    type="body_medium"
                                    emphasized
                                    style={{ color: Colors[colorScheme].text }}
                                >
                                    {reason}
                                </ThemedText>

                                <View style={styles.checkbox}>
                                    {selected ? (
                                        <Feather
                                            name="check"
                                            size={14}
                                            color={Colors[colorScheme].text}
                                        />
                                    ) : null}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.reportButton,
                            (!selectedReason || submitting) &&
                                styles.reportButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!selectedReason || submitting}
                        activeOpacity={0.85}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <ThemedText style={styles.reportButtonText}>
                                Report
                            </ThemedText>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        height: 48,
        backgroundColor: "#0B5FFF",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 12,
    },

    reasonList: {
        gap: 18,
        paddingVertical: 4,
    },
    reasonRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    reasonText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#111111",
    },
    checkbox: {
        width: 15,
        height: 15,
        borderWidth: 1.3,
        borderColor: "#111111",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    footer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 26,
    },
    reportButton: {
        width: 132,
        height: 42,
        borderRadius: 22,
        backgroundColor: "#F20D32",
        justifyContent: "center",
        alignItems: "center",
    },
    reportButtonDisabled: {
        opacity: 0.55,
    },
    reportButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
});
