import { Image } from "expo-image";
import {
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import axios from "axios";

import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Colors } from "@/constants/theme";

export default function CreatePost() {
    const SERVER_URL =
        (process.env.EXPO_PUBLIC_SERVER_URL as string) ?? undefined;

    const colorScheme = useColorScheme() ?? "light";
    const queryClient = useQueryClient();

    const { isPending, isError, data, error } = useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
    });

    async function fetchUsers() {
        console.log("pressed");
        console.log(SERVER_URL);
        try {
            console.log("trying");
            const results = await axios.get("http://10.0.2.2:8000/ping", {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            console.log(results.data);
            return results.data;
        } catch (error: any) {
            console.error(error);
            throw error;
        }
    }

    return (
        <Animated.ScrollView>
            <Header />
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="heading">Create Post!</ThemedText>
            </ThemedView>
            <Pressable
                onPress={() => {
                    fetchUsers();
                }}
                style={[
                    styles.button,
                    { backgroundColor: Colors[colorScheme].tint },
                ]}
            >
                <ThemedText style={{ color: Colors[colorScheme].button_text }}>
                    Fetch
                </ThemedText>
                {data ? (
                    <ThemedText
                        style={{ color: Colors[colorScheme].button_text }}
                    >
                        {data.message}
                    </ThemedText>
                ) : (
                    <Text>Stop</Text>
                )}
            </Pressable>
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    button: {
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 12,
        marginTop: 12,
    },
});
