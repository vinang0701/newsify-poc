import { Header } from "@/components/header";

import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileTabLayout() {
    return (
        <SafeAreaProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="[user_id]"
                    options={{ headerShown: false }}
                />
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
