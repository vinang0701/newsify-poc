import { Tabs } from "expo-router";
import React from "react";
import Feather from "@expo/vector-icons/Feather";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Header } from "@/components/header";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <View style={{ flex: 1 }}>
            <Header />
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarButton: HapticTab,
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <IconSymbol
                                size={28}
                                name="house.fill"
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="create-post"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Feather
                                size={28}
                                name="plus-circle"
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <IconSymbol
                                size={28}
                                name="paperplane.fill"
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}
