import React from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { UserRequestItem } from "@/hooks/useRequests";
import { ThemedText } from "../themed-text";
import { Colors } from "@/constants/theme";

type Props = {
    data: UserRequestItem[];
    refreshing: boolean;
    onRefresh: () => void;
};

function getStatusStyle(status: UserRequestItem["status"]) {
    switch (status) {
        case "approved":
            return styles.statusApproved;
        case "rejected":
            return styles.statusRejected;
        default:
            return styles.statusPending;
    }
}

function getStatusLabel(status: UserRequestItem["status"]) {
    switch (status) {
        case "approved":
            return "Approved";
        case "rejected":
            return "Rejected";
        default:
            return "Pending";
    }
}

export default function RequestList({ data, refreshing, onRefresh }: Props) {
    const colorScheme = useColorScheme() ?? "light";
    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={
                data.length === 0
                    ? styles.emptyListContainer
                    : styles.listContentContainer
            }
            ListEmptyComponent={
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>No requests found</Text>
                    <Text style={styles.emptyText}>
                        You have not submitted any requests yet.
                    </Text>
                </View>
            }
            renderItem={({ item }) => (
                <>
                    {item.request_type === "community_application" ? (
                        <View style={styles.card}>
                            <ThemedText
                                type="defaultSemiBold"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                Community Application:
                            </ThemedText>

                            <ThemedText
                                type="default"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                Community creation for: {item.community_name}
                            </ThemedText>

                            <ThemedText
                                type="body_medium"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                Status:{" "}
                                <Text style={getStatusStyle(item.status)}>
                                    {getStatusLabel(item.status)}
                                </Text>
                            </ThemedText>

                            {item.status === "rejected" &&
                            item.rejection_reason ? (
                                <View style={styles.reasonBadge}>
                                    <Text style={styles.reasonBadgeText}>
                                        Rejection Reason:{" "}
                                        {item.rejection_reason}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        <View style={styles.card}>
                            <ThemedText
                                type="defaultSemiBold"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                Post Request to {item.community_name}:
                            </ThemedText>

                            <ThemedText
                                type="body_medium"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                Title: {item.title}
                            </ThemedText>

                            {!!item.subtitle && (
                                <ThemedText
                                    type="body_medium"
                                    style={{ color: Colors[colorScheme].text }}
                                >
                                    {item.subtitle}
                                </ThemedText>
                            )}

                            <ThemedText
                                type="body_medium"
                                style={{ color: Colors[colorScheme].text }}
                            >
                                Status:{" "}
                                <Text style={getStatusStyle(item.status)}>
                                    {getStatusLabel(item.status)}
                                </Text>
                            </ThemedText>

                            {item.status === "rejected" &&
                            item.rejection_reason ? (
                                <View style={styles.reasonBadge}>
                                    <Text style={styles.reasonBadgeText}>
                                        Rejection Reason
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    )}
                </>
            )}
        />
    );
}

const styles = StyleSheet.create({
    listContentContainer: {
        paddingHorizontal: 12,
        paddingBottom: 16,
        gap: 10,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 4,
    },
    labelText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    mainText: {
        fontSize: 14,
        color: "#111827",
        lineHeight: 14,
    },
    subText: {
        fontSize: 12,
        color: "#374151",
        lineHeight: 13,
    },
    statusLine: {
        fontSize: 12,
        color: "#111827",
    },
    statusPending: {
        color: "#2563EB",
        fontWeight: "700",
    },
    statusApproved: {
        color: "#059669",
        fontWeight: "700",
    },
    statusRejected: {
        color: "#DC2626",
        fontWeight: "700",
    },
    reasonBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#666666",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    reasonBadgeText: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "700",
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    emptyWrap: {
        alignItems: "center",
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
    },
});
