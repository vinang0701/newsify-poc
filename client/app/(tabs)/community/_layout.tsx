import { Header } from "@/components/header";

import { Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function CommunitiesTabLayout() {
    return (
        <SafeAreaProvider>
            <Stack
                initialRouteName="index"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                    name="[communityId]"
                    options={{ headerShown: false }}
                />
            </Stack>
        </SafeAreaProvider>
    );
}
