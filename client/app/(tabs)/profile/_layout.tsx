import { Header } from "@/components/header";

import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileTabLayout() {
    return (
        <SafeAreaProvider>
            <Stack
                initialRouteName="[email]"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="[email]" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaProvider>
    );
}
