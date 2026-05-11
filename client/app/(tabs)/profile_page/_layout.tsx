import { Header } from "@/components/header";

import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileTabLayout() {
    return (
        <SafeAreaProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
                initialRouteName="index"
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                    name="communities"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="following"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="followers"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="bookmarks"
                    options={{ headerShown: false }}
                />
            </Stack>
        </SafeAreaProvider>
    );
}
