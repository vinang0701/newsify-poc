import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Header } from "@/components/header";
import { TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme() || "light";

    return (
        <SafeAreaProvider>
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <Stack
                    initialRouteName="(tabs)"
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen
                        name="(tabs)"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="search"
                        options={{
                            headerShown: false,
                        }}
                    />
                </Stack>

                <StatusBar style="auto" />
            </ThemeProvider>
        </SafeAreaProvider>
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
