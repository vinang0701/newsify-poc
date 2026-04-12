import { Header } from "@/components/header";

import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileTabLayout() {
    const current_user_id = "4813d507-9b97-4bb7-bee4-39ec47070889";
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
