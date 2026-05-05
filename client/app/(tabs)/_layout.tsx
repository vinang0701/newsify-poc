// import {registerGlobals} from "@livekit/react-native";
// registerGlobals();
import AchievementToast from "@/components/achievement_toast";
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Achievement } from "@/hooks/useAchievements";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function TabLayout() {
    const colorScheme = useColorScheme() || "light";
    const { user, metadata } = useAuthStore();

    const [achievementPopupVisible, setAchievementPopupVisible] =
        useState(false);
    const [unlockedAchievement, setUnlockedAchievement] =
        useState<Achievement | null>(null);

    // UPDATED: fetch completed achievements regularly so unlock toast can appear
    const { data: achievementsData = [] } = useQuery<Achievement[]>({
        queryKey: ["achievements_progress", metadata?.inst_id, user?.id],
        queryFn: async () => {
            const response = await api.get(
                `/${metadata?.inst_id}/users/${user?.id}/achievements/unlocked`,
            );
            return response.data;
        },
        enabled: !!metadata?.inst_id && !!user?.id,
        refetchInterval: 1000 * 60, // UPDATED: checks every 5 seconds
    });

    useEffect(() => {
        const checkUnlockedAchievements = async () => {
            if (!user?.id || achievementsData.length === 0) return;

            const storageKey = `seen_achievements_${user?.id}`;

            const stored = await AsyncStorage.getItem(storageKey);
            const seenIds: string[] = stored ? JSON.parse(stored) : [];

            const newlyUnlocked = achievementsData.find(
                (achievement) =>
                    achievement.is_completed &&
                    !seenIds.includes(achievement.achievement_id),
            );

            if (!newlyUnlocked) return;

            await AsyncStorage.setItem(
                storageKey,
                JSON.stringify([...seenIds, newlyUnlocked.achievement_id]),
            );

            setUnlockedAchievement(newlyUnlocked);
            setAchievementPopupVisible(true);

            setTimeout(() => {
                setAchievementPopupVisible(false);
            }, 3000);
        };

        checkUnlockedAchievements();
    }, [achievementsData, user?.id]);

    return (
        <View style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <Tabs
                    backBehavior="order"
                    screenOptions={{
                        animation: "shift",
                        tabBarActiveTintColor:
                            Colors[colorScheme ?? "light"].tint,
                        tabBarInactiveTintColor:
                            Colors[colorScheme ?? "light"].tabIconSelected,
                        headerShown: false,
                        tabBarStyle: { height: 80 },
                        tabBarShowLabel: false,
                        tabBarButton: HapticTab,
                    }}
                >
                    <Tabs.Screen
                        name="index"
                        options={{
                            tabBarIcon: ({ focused, color }) =>
                                focused ? (
                                    <MaterialCommunityIcons
                                        size={28}
                                        name="home"
                                        color={color}
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        size={28}
                                        name="home-outline"
                                        color={color}
                                    />
                                ),
                        }}
                    />
                    <Tabs.Screen
                        name="community"
                        options={{
                            tabBarIcon: ({ focused, color }) =>
                                focused ? (
                                    <MaterialCommunityIcons
                                        size={28}
                                        name="account-group"
                                        color={color}
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        size={28}
                                        name="account-group-outline"
                                        color={color}
                                    />
                                ),
                        }}
                    />
                    <Tabs.Screen
                        name="create"
                        options={{
                            tabBarIcon: ({ focused, color }) =>
                                focused ? (
                                    <MaterialCommunityIcons
                                        size={28}
                                        name="plus-box"
                                        color={color}
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        size={28}
                                        name="plus-box-outline"
                                        fill={color}
                                        color={color}
                                    />
                                ),
                        }}
                    />

                    <Tabs.Screen
                        name="profile_page"
                        options={{
                            tabBarIcon: ({ focused, color }) =>
                                focused ? (
                                    <MaterialCommunityIcons
                                        name="account"
                                        size={28}
                                        color={color}
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        name="account-outline"
                                        size={28}
                                        color={color}
                                    />
                                ),
                        }}
                    />
                </Tabs>
                <AchievementToast
                    visible={achievementPopupVisible}
                    achievementName={unlockedAchievement?.achievement_name}
                    badgeUrl={unlockedAchievement?.badge_url}
                />
            </BottomSheetModalProvider>
        </View>
    );
}
