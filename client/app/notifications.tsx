import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";

import NotificationTabs from "@/components/notifications/NotificationTabs";
import NotificationList from "@/components/notifications/NotificationList";
import InvitationList from "@/components/notifications/InvitationList";
import { NotificationItem, useNotifications } from "@/hooks/useNotifications";
import { useInvitations } from "@/hooks/useInvitations";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";

export default function NotificationsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"notifications" | "invitations">(
        "notifications",
    );

    const {
        notifications,
        loading: notificationsLoading,
        refreshing: notificationsRefreshing,
        error: notificationsError,
        refresh: refreshNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const {
        invitations,
        loading: invitationsLoading,
        refreshing: invitationsRefreshing,
        error: invitationsError,
        refresh: refreshInvitations,
        respondToInvitation,
    } = useInvitations();

    const { unreadCount, refetchUnreadCount } = useUnreadNotificationCount();

    const handleNotificationPress = async (item: NotificationItem) => {
        try {
            if (!item.is_read) {
                await markAsRead(item.notification_id);
                await refetchUnreadCount();
            }

            if (
                item.reference_id &&
                (item.notification_type.toLocaleLowerCase() === "comment" ||
                    item.notification_type.toLocaleLowerCase() === "like")
            ) {
                router.push({
                    pathname: "/view_news_post",
                    params: { news_id: item.reference_id },
                });
            }

            if (item.reference_id && item.reference_table === "communities") {
                router.push({
                    pathname: "/(tabs)/community/[communityId]",
                    params: { communityId: item.reference_id },
                });
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to open notification");
        }
    };

    const handleReadAll = async () => {
        try {
            await markAllAsRead();
            await refetchUnreadCount();
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to mark all as read");
        }
    };

    const handleRespond = async (
        id: string,
        action: "accepted" | "declined",
    ) => {
        try {
            await respondToInvitation(id, action);
            Alert.alert("Success", `Invitation ${action}.`);
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to respond");
        }
    };

    const loading =
        activeTab === "notifications"
            ? notificationsLoading
            : invitationsLoading;

    const refreshing =
        activeTab === "notifications"
            ? notificationsRefreshing
            : invitationsRefreshing;

    const error =
        activeTab === "notifications" ? notificationsError : invitationsError;

    const refresh =
        activeTab === "notifications"
            ? refreshNotifications
            : refreshInvitations;

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.topHeader}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    {activeTab === "notifications" ? (
                        <TouchableOpacity onPress={handleReadAll}>
                            <Text style={styles.readAllText}>Read all</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            <NotificationTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "notifications" && unreadCount > 0 ? (
                <View style={styles.infoBar}>
                    <Text style={styles.infoText}>{unreadCount} unread</Text>
                </View>
            ) : null}

            {loading ? (
                <View style={styles.centerWrap}>
                    <ActivityIndicator size="small" color="#2563EB" />
                </View>
            ) : error ? (
                <View style={styles.centerWrap}>
                    <Text style={styles.errorTitle}>Unable to load</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={refresh}
                    >
                        <Text style={styles.retryButtonText}>Try again</Text>
                    </TouchableOpacity>
                </View>
            ) : activeTab === "notifications" ? (
                <NotificationList
                    data={notifications}
                    refreshing={refreshing}
                    onRefresh={refresh}
                    onPressItem={handleNotificationPress}
                />
            ) : (
                <InvitationList
                    data={invitations}
                    refreshing={refreshing}
                    onRefresh={refresh}
                    onRespond={handleRespond}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    topHeader: {
        height: 44,
        backgroundColor: "#0B5FFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },
    backButton: {
        width: 28,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    headerRight: {
        width: 60,
        alignItems: "flex-end",
    },
    readAllText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "600",
    },
    infoBar: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "#F9FAFB",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    infoText: {
        fontSize: 12,
        color: "#4B5563",
    },
    centerWrap: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        backgroundColor: "#F3F4F6",
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
    },
    errorText: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: "#2563EB",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
});
