import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const StreamStackLayout = () => {
    return (
        <Stack
            initialRouteName="index"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
};

export default StreamStackLayout;

const styles = StyleSheet.create({});
