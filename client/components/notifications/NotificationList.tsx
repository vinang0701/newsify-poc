import React from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { NotificationItem } from "@/hooks/useNotifications";

type Props = {
    data: NotificationItem[];
    refreshing: boolean;
    onRefresh: () => void;
    onPressItem: (item: NotificationItem) => void;
};

function formatRelativeTime(dateString: string) {
    const created = new Date(dateString).getTime();
    const now = Date.now();
    const diffMins = Math.floor((now - created) / 1000 / 60);

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
}

function AvatarPlaceholder() {
    return <View style={styles.avatar} />;
}

export default function NotificationList({
    data,
    refreshing,
    onRefresh,
    onPressItem,
}: Props) {
    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={data.length === 0 ? styles.emptyListContainer : undefined}
            ListEmptyComponent={
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>No notifications available</Text>
                    <Text style={styles.emptyText}>
                        You do not have any notifications at the moment.
                    </Text>
                </View>
            }
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.row}
                    onPress={() => onPressItem(item)}
                    activeOpacity={0.8}
                >
                    <AvatarPlaceholder />
                    <View style={styles.content}>
                        <Text style={styles.messageText}>
                            <Text style={styles.boldText}>
                                {item.actor_name || "System"}
                            </Text>{" "}
                            {item.body || item.title}
                        </Text>
                    </View>
                    <Text style={styles.timeText}>
                        {formatRelativeTime(item.created_at)}
                    </Text>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: "#F3F4F6",
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#D1D5DB",
        marginTop: 1,
        marginRight: 8,
    },
    content: {
        flex: 1,
        paddingRight: 8,
    },
    messageText: {
        fontSize: 9.5,
        lineHeight: 13,
        color: "#111827",
    },
    boldText: {
        fontWeight: "700",
    },
    timeText: {
        fontSize: 8.5,
        color: "#6B7280",
        marginTop: 1,
        minWidth: 18,
        textAlign: "right",
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