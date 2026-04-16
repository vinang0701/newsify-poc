import React from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { UserRequestItem } from "@/hooks/useRequests";

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

function getRequestLabel(item: UserRequestItem) {
    if (item.request_type === "community_application") {
        return "Community Application:";
    }
    return "Post Request to Community:";
}

export default function RequestList({
    data,
    refreshing,
    onRefresh,
}: Props) {
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
                <View style={styles.card}>
                    <Text style={styles.labelText}>{getRequestLabel(item)}</Text>

                    <Text style={styles.mainText}>{item.title}</Text>

                    {!!item.subtitle && (
                        <Text style={styles.subText}>{item.subtitle}</Text>
                    )}

                    {!!item.community_name &&
                        item.request_type === "post_request" && (
                            <Text style={styles.subText}>
                                Community: {item.community_name}
                            </Text>
                        )}

                    <Text style={styles.statusLine}>
                        Status:{" "}
                        <Text style={getStatusStyle(item.status)}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </Text>

                    {item.status === "rejected" && item.rejection_reason ? (
                        <View style={styles.reasonBadge}>
                            <Text style={styles.reasonBadgeText}>
                                Rejection Reason
                            </Text>
                        </View>
                    ) : null}
                </View>
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
    },
    labelText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    mainText: {
        fontSize: 10,
        color: "#111827",
        lineHeight: 14,
    },
    subText: {
        marginTop: 2,
        fontSize: 9.5,
        color: "#374151",
        lineHeight: 13,
    },
    statusLine: {
        marginTop: 4,
        fontSize: 9.5,
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
        marginTop: 6,
        backgroundColor: "#E5E7EB",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    reasonBadgeText: {
        fontSize: 8.5,
        color: "#374151",
        fontWeight: "600",
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