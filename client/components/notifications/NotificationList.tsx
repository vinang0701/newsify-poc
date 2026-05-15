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
import { ThemedText } from "../themed-text";
import { Image } from "expo-image";
import Feather from "@expo/vector-icons/Feather";

type Props = {
    data: NotificationItem[];
    refreshing: boolean;
    onRefresh: () => void;
    onPressItem: (item: NotificationItem) => void;
};

type NotificationViewProps = {
    notification: NotificationItem;
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

const NotificationView = ({ notification }: NotificationViewProps) => {
    switch (notification.notification_type.toLocaleLowerCase()) {
        case "comment":
            return (
                <View style={styles.content}>
                    <View style={{ flexDirection: "row" }}>
                        <ThemedText type="body_medium" emphasized>
                            {notification.actor_name}{" "}
                        </ThemedText>
                        <ThemedText type="body_medium">
                            commented on your post:
                        </ThemedText>
                    </View>
                    <ThemedText type="body_medium">
                        "{notification.message}"
                    </ThemedText>
                </View>
            );

        case "post_published":
            return (
                <View style={styles.content}>
                    <ThemedText type="defaultSemiBold">
                        Your story has been published!
                    </ThemedText>
                    <View>
                        <ThemedText>{notification.title}</ThemedText>
                        <ThemedText>{notification.message}</ThemedText>
                    </View>
                </View>
            );

        case "like":
            return (
                <View style={styles.content}>
                    <View style={{ flexDirection: "row" }}>
                        <ThemedText type="body_medium" emphasized>
                            {notification.actor_name}{" "}
                        </ThemedText>
                        <ThemedText type="body_medium">
                            liked your post:
                        </ThemedText>
                    </View>
                    <ThemedText type="body_medium">
                        "{notification.message}"
                    </ThemedText>
                </View>
            );

        default:
            return (
                <View style={styles.content}>
                    <ThemedText
                        type="body_medium"
                        style={{ overflow: "hidden" }}
                    >
                        {notification.message}
                    </ThemedText>
                </View>
            );
    }
};

export default function NotificationList({
    data,
    refreshing,
    onRefresh,
    onPressItem,
}: Props) {
    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.notification_id}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={
                data.length === 0 ? styles.emptyListContainer : undefined
            }
            ListEmptyComponent={
                <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>
                        No notifications available
                    </Text>
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
                    {/* <AvatarPlaceholder /> */}
                    {item.actor_avatar_url !== null ? (
                        <Image
                            source={{ uri: item.actor_avatar_url }}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 100,
                            }}
                            contentFit="contain"
                        />
                    ) : (
                        <Feather
                            name="mail"
                            size={38}
                            style={{
                                marginRight: 8,
                                alignSelf: "center",
                                paddingLeft: 4,
                            }}
                        />
                    )}
                    {/* <View style={styles.content}>
                        <Text style={styles.messageText}>
                            <Text style={styles.boldText}>
                                {item.actor_name || "System"}
                            </Text>{" "}
                            {item.body || item.title}
                        </Text>
                    </View> */}
                    <NotificationView notification={item} />
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
        gap: 8,
    },

    content: {
        flex: 1,
        paddingRight: 8,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 15,
        color: "#111827",
    },
    boldText: {
        fontWeight: "700",
    },
    timeText: {
        fontSize: 11,
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
