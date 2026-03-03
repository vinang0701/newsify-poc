import { HapticTab } from "@/components/haptic-tab";
import { Header } from "@/components/header";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
    const colorScheme = useColorScheme() || "light";

    return (
        <View style={{ flex: 1 }}>
            <Header />
            <Tabs
                backBehavior="order"
                screenOptions={{
                    animation: "shift",
                    tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                    tabBarInactiveTintColor:
                        Colors[colorScheme ?? "light"].tint,
                    headerShown: false,
                    tabBarStyle: { height: 80 },
                    tabBarShowLabel: false,
                    tabBarButton: HapticTab,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons
                                size={30}
                                name="home"
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="create-post"
                    options={{
                        tabBarIcon: ({ focused, color }) =>
                            focused ? (
                                <MaterialIcons
                                    size={30}
                                    name="add-circle"
                                    color={color}
                                />
                            ) : (
                                <MaterialIcons
                                    size={30}
                                    name="add-circle-outline"
                                    color={color}
                                />
                            ),
                    }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{
                        tabBarIcon: ({ focused, color }) =>
                            focused ? (
                                <MaterialIcons
                                    name="person"
                                    size={30}
                                    color={color}
                                />
                            ) : (
                                <MaterialIcons
                                    name="person-outline"
                                    size={30}
                                    color={color}
                                />
                            ),
                    }}
                />
            </Tabs>
        </View>
    );
}
