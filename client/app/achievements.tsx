import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Pressable,
    useColorScheme,
} from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";

type Achievement = {
    achievement_id: string;
    achievement_name: string;
    achievement_detail: string;
    metric_key: string;
    required_count: number;
    current_count: number;
    is_completed: boolean;
    badge_url?: string | null;
};

export default function AchievementsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? "light";
    const { user_id } = useLocalSearchParams<{ user_id?: string }>();
    const { metadata } = useAuthStore();

    const inst_id = metadata?.inst_id;

    console.log("Achievements screen opened");
    console.log("received user_id:", user_id);
    
    const {
        data: achievements = [],
        isLoading,
        error,
    } = useQuery<Achievement[]>({
        queryKey: ["achievements", user_id],
        queryFn: async () => {
            const response = await api.get(
                `/${inst_id}/users/${user_id}/achievements`,
            );
            return response.data;
        },
        enabled: !!inst_id && !!user_id,
    });

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: Colors[colorScheme].bg },
            ]}
        >
            <View
                style={[
                    styles.header,
                    { backgroundColor: Colors[colorScheme].tint },
                ]}
            >
                <Pressable onPress={() => router.back()}>
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].button_text}
                    />
                </Pressable>

                <Text
                    style={[
                        styles.headerTitle,
                        { color: Colors[colorScheme].button_text },
                    ]}
                >
                    Achievements
                </Text>

                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator
                        size="large"
                        color={Colors[colorScheme].tint}
                    />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text>Could not load achievements.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    {achievements.map((item) => {
                        const progress =
                            item.required_count > 0
                                ? Math.min(
                                      item.current_count /
                                          item.required_count,
                                      1,
                                  )
                                : 0;

                        return (
                            <View
                                key={item.achievement_id}
                                style={[
                                    styles.card,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].bg_light,
                                        borderColor:
                                            Colors[colorScheme].border,
                                    },
                                ]}
                            >
                                <View style={styles.row}>
                                    <Image
                                        source={
                                            item.badge_url
                                                ? { uri: item.badge_url }
                                                : require("@/assets/images/profile.png")
                                        }
                                        style={[
                                            styles.badge,
                                            {
                                                opacity: item.is_completed
                                                    ? 1
                                                    : 0.35,
                                            },
                                        ]}
                                    />

                                    <View style={{ flex: 1 }}>
                                        <ThemedText type="defaultSemiBold">
                                            {item.achievement_name}
                                        </ThemedText>

                                        <ThemedText
                                            type="caption"
                                            style={{ opacity: 0.7 }}
                                        >
                                            {item.achievement_detail}
                                        </ThemedText>

                                        <Text style={styles.progressText}>
                                            {item.current_count} /{" "}
                                            {item.required_count}
                                        </Text>

                                        <View style={styles.progressBar}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${progress * 100}%`,
                                                        backgroundColor:
                                                            item.is_completed
                                                                ? "#22C55E"
                                                                : Colors[
                                                                      colorScheme
                                                                  ].tint,
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </View>

                                    {item.is_completed && (
                                        <Feather
                                            name="check-circle"
                                            size={22}
                                            color="#22C55E"
                                        />
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 48,
        paddingBottom: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    content: {
        padding: 16,
        gap: 12,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    badge: {
        width: 54,
        height: 54,
        borderRadius: 27,
    },
    progressText: {
        fontSize: 12,
        marginTop: 6,
        marginBottom: 4,
        color: "#6B7280",
    },
    progressBar: {
        height: 8,
        borderRadius: 10,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 10,
    },
});