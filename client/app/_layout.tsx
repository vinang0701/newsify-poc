import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Roboto_400Regular, useFonts } from "@expo-google-fonts/roboto";
import { TextInput, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Colors } from "@/constants/theme";
import { useEffect } from "react";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme() || "light";
    const [loaded, error] = useFonts({
        Roboto: require("@/assets/fonts/Roboto-Regular.ttf"),
        // Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

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
