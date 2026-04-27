import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { reportPost } from "@/hooks/useReportPost";

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
            Alert.alert("Select a reason", "Please select a report reason first.");
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
                ]
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Report Post</Text>

                <Text style={styles.subtitle}>
                    Please select the category that best describes your issue
                </Text>

                <View style={styles.reasonList}>
                    {REPORT_REASONS.map((reason) => {
                        const selected = selectedReason === reason;

                        return (
                            <Pressable
                                key={reason}
                                style={styles.reasonRow}
                                onPress={() => setSelectedReason(reason)}
                            >
                                <Text style={styles.reasonText}>{reason}</Text>

                                <View style={styles.checkbox}>
                                    {selected ? (
                                        <Feather name="check" size={12} color="#111111" />
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
                            (!selectedReason || submitting) && styles.reportButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!selectedReason || submitting}
                        activeOpacity={0.85}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.reportButtonText}>Report</Text>
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
        paddingTop: 18,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111111",
        marginBottom: 18,
    },
    subtitle: {
        fontSize: 11,
        color: "#555555",
        marginBottom: 14,
    },
    reasonList: {
        gap: 13,
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