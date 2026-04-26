import { Header } from "@/components/header";

import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileTabLayout() {
    const current_user_id = "7369b0d7-3ba3-4a28-bfbe-0e7addaf3eec";
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
                    initialParams={{ user_id: current_user_id }}
                />
                <Stack.Screen
                    name="following"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="followers"
                    options={{ headerShown: false }}
                />
            </Stack>
        </SafeAreaProvider>
    );
}
