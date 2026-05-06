import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Image } from "expo-image";

type Props = {
    visible: boolean;
    achievementName?: string;
    badgeUrl?: string | null;
};

export default function AchievementToast({
    visible,
    achievementName,
    badgeUrl,
}: Props) {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <Image
                source={
                    badgeUrl
                        ? { uri: badgeUrl }
                        : require("@/assets/images/profile.png")
                }
                style={styles.badge}
            />
            <Text style={styles.text}>
                🎉 {achievementName || "Achievement Unlocked"}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: "#111",
        padding: 12,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        zIndex: 999,
        elevation: 999,
    },
    text: {
        color: "#fff",
        fontWeight: "600",
    },
    badge: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
});