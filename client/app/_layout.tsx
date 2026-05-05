import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "@expo-google-fonts/roboto";
import { TextInput, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/utils/authStore";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import Loading from "@/components/loading";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const { session, isVerified, initialized } = useAuthStore();
    const colorScheme = useColorScheme() || "light";
    const [loaded, error] = useFonts({
        Roboto: require("@/assets/fonts/Roboto-Regular.ttf"),
        // Poppins: require("@/assets/fonts/Poppins-Regular.ttf"),
    });
    if (!initialized) {
        return <Loading />;
    }

    // Create a client
    const queryClient = new QueryClient();

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
                <BottomSheetModalProvider>
                    <SafeAreaProvider>
                        <ThemeProvider
                            value={
                                colorScheme === "dark"
                                    ? DarkTheme
                                    : DefaultTheme
                            }
                        >
                            <Stack
                                screenOptions={{
                                    headerShown: false,
                                }}
                            >
                                <Stack.Protected
                                    guard={session !== null && isVerified}
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
                                    <Stack.Screen
                                        name="comment"
                                        options={{
                                            headerShown: false,
                                            presentation: "transparentModal",
                                            animation: "none",
                                        }}
                                    />
                                    <Stack.Screen //ADDED
                                        name="achievements"
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="[user_id]"
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="update_password"
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                </Stack.Protected>
                                <Stack.Protected
                                    guard={
                                        !session ||
                                        session === null ||
                                        !isVerified
                                    }
                                >
                                    <Stack.Screen
                                        name="login"
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="forgot_password"
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                    <Stack.Screen
                                        name="verify_otp"
                                        options={{
                                            headerShown: false,
                                        }}
                                    />
                                </Stack.Protected>
                            </Stack>
                            <StatusBar style="auto" />
                        </ThemeProvider>
                    </SafeAreaProvider>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
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
