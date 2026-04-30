import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Image } from "expo-image";

type Props = {
    visible: boolean;
    title: string;
    badge?: string;
};

export default function AchievementToast({ visible, title, badge }: Props) {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            {badge && (
                <Image source={{ uri: badge }} style={styles.badge} />
            )}
            <Text style={styles.text}>
                🎉 Achievement Unlocked: {title}
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
    },
    text: {
        color: "#fff",
        fontWeight: "600",
    },
    badge: {
        width: 30,
        height: 30,
    },
});