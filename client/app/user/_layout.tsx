import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="[user_id]" />
            <Stack.Screen name="following" />
            <Stack.Screen name="followers" />
            <Stack.Screen name="communities" />
        </Stack>
    );
}
