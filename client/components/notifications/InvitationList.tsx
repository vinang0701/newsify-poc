import React from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { InvitationItem } from "@/hooks/useInvitations";

type Props = {
    data: InvitationItem[];
    refreshing: boolean;
    onRefresh: () => void;
    onRespond: (id: string, action: "accepted" | "declined") => void;
};

function AvatarPlaceholder() {
    return <View style={styles.avatar} />;
}

export default function InvitationList({
    data,
    refreshing,
    onRefresh,
    onRespond,
}: Props) {
    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={
                data.length === 0 ? styles.emptyListContainer : undefined
            }
            ListEmptyComponent={
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>No invitations available</Text>
                    <Text style={styles.emptyText}>
                        You do not have any invitations at the moment.
                    </Text>
                </View>
            }
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.topRow}>
                        <AvatarPlaceholder />
                        <View style={styles.textWrap}>
                            <Text style={styles.messageText}>
                                <Text style={styles.boldText}>
                                    {item.inviter_name || "Someone"}
                                </Text>{" "}
                                invited you to join{" "}
                                <Text style={styles.boldText}>
                                    {item.community_name}
                                </Text>
                                .
                            </Text>

                            {item.status === "pending" ? (
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity
                                        style={styles.acceptButton}
                                        onPress={() => onRespond(item.id, "accepted")}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.acceptText}>Accept</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.declineButton}
                                        onPress={() => onRespond(item.id, "declined")}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.declineText}>Decline</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.statusRow}>
                                    <Text style={styles.statusText}>
                                        {item.status === "accepted"
                                            ? "Joined"
                                            : "Declined"}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    card: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: "#F3F4F6",
    },
    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#D1D5DB",
        marginRight: 8,
        marginTop: 2,
    },
    textWrap: {
        flex: 1,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 14,
        color: "#111827",
    },
    boldText: {
        fontWeight: "700",
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 12,
    },
    acceptButton: {
        backgroundColor: "#1877F2",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 4,
        minWidth: 70,
        alignItems: "center",
    },
    acceptText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "700",
    },
    declineButton: {
        backgroundColor: "#EF4444", // red
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 4,
        minWidth: 70,
        alignItems: "center",
    },

    declineText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "700",
    },
    statusRow: {
        marginTop: 8,
    },
    statusText: {
        fontSize: 10,
        color: "#6B7280",
        textTransform: "capitalize",
        fontWeight: "600",
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: "center",
        backgroundColor: "#F3F4F6",
    },
    emptyWrap: {
        paddingHorizontal: 24,
        alignItems: "center",
    },
    emptyTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 18,
    },
});