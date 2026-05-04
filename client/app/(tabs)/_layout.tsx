import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
    const colorScheme = useColorScheme() || "light";

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
                        name="stream"
                        options={{
                            tabBarIcon: ({ focused, color }) =>
                                focused ? (
                                    <MaterialCommunityIcons
                                        name="play-box"
                                        size={28}
                                        color={color}
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        name="play-box-outline"
                                        size={28}
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
            </BottomSheetModalProvider>
        </View>
    );
}
