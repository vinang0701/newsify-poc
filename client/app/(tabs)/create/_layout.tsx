import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const CreateStackLayout = () => {
    return (
        <Stack
            initialRouteName="index"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="draft" />
            <Stack.Screen name="drafts" />
        </Stack>
    );
};

export default CreateStackLayout;
