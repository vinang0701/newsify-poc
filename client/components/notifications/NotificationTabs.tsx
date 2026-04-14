import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
    activeTab: "notifications" | "invitations";
    onChange: (tab: "notifications" | "invitations") => void;
};

export default function NotificationTabs({ activeTab, onChange }: Props) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.tab}
                onPress={() => onChange("notifications")}
                activeOpacity={0.8}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "notifications" && styles.activeTabText,
                    ]}
                >
                    Notifications
                </Text>
                {activeTab === "notifications" && <View style={styles.activeLine} />}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tab}
                onPress={() => onChange("invitations")}
                activeOpacity={0.8}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "invitations" && styles.activeTabText,
                    ]}
                >
                    Invitations
                </Text>
                {activeTab === "invitations" && <View style={styles.activeLine} />}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        height: 42,
    },
    tab: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    tabText: {
        fontSize: 14,
        color: "#B0B0B0",
        fontWeight: "500",
    },
    activeTabText: {
        color: "#111827",
        fontWeight: "700",
    },
    activeLine: {
        position: "absolute",
        bottom: 0,
        width: 90,
        height: 2,
        backgroundColor: "#111827",
    },
});