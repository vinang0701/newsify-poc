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
            <Stack.Screen name="player" />
            <Stack.Screen name="prejoin" />
        </Stack>
    );
};

export default StreamStackLayout;

const styles = StyleSheet.create({});
