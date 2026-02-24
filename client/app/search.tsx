import {
    Text,
    StyleSheet,
    View,
    Button,
    Pressable,
    TextInput,
    useColorScheme,
} from "react-native";
import React, { Component } from "react";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";

export default function Search() {
    const router = useRouter();
    const colorScheme = useColorScheme() || "light";
    return (
        <SafeAreaView
            edges={["top"]}
            style={[
                styles.searchBarContainer,
                { backgroundColor: Colors[colorScheme].bg_light },
            ]}
        >
            <Pressable onPress={router.back}>
                <Feather
                    name="arrow-left"
                    size={24}
                    color={Colors[colorScheme].text}
                />
            </Pressable>

            <TextInput
                placeholder="Search..."
                style={[
                    styles.searchInput,
                    { backgroundColor: Colors[colorScheme].bg },
                ]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    searchBarContainer: {
        flex: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        borderRadius: 20,
        paddingLeft: 16,
        marginLeft: 8,
    },
});
