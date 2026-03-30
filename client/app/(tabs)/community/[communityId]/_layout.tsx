import { Stack } from "expo-router";

export default function CommunityStackLayout() {
    return (
        <Stack
            initialRouteName="index"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="members" />
        </Stack>
    );
}
