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
            <Stack.Screen name="post_requests" />
            <Stack.Screen name="view_post_request" />
        </Stack>
    );
}
