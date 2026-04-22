import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    Pressable,
    useColorScheme,
    ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const Login = () => {
    const colorScheme = "light";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isVisible, setisVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (email === "" || password === "") {
                setError("Please enter a valid email or password.");
                return;
            }
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            const payload = JSON.parse(
                atob(data.session.access_token.split(".")[1]),
            );
            const role = payload.app_metadata.user_role;

            // Check if this user already has preferences saved
            const { data: existingPrefs } = await supabase
                .from("user_preferences")
                .select("category_id")
                .eq("user_id", data.user.id)
                .limit(1); // we only need to know if at least one exists

            if (existingPrefs && existingPrefs.length > 0) {
                // User has preferences → go straight to feed
                router.push("/(tabs)");
            } else {
                // First time login → go to preferences setup
                router.push("/(tabs)/profile_page/preferences");
            }

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
            }}
        >
            <ImageBackground
                source={require("@/assets/images/gradient-bg.png")}
                style={{
                    flex: 1,
                    gap: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 16,
                }}
                resizeMode="cover"
            >
                <View style={{ gap: 8 }}>
                    <ThemedText
                        type="heading"
                        style={{
                            textAlign: "center",
                            color: Colors[colorScheme].bg_light,
                        }}
                    >
                        Sign in
                    </ThemedText>
                    <ThemedText
                        type="body_medium"
                        style={{ color: Colors[colorScheme].bg_dark }}
                    >
                        Enter your email and password to sign in.
                    </ThemedText>
                </View>
                <View style={{ width: "100%", gap: 12 }}>
                    <View style={{ gap: 4 }}>
                        <ThemedText
                            style={{ color: Colors[colorScheme].bg_light }}
                        >
                            Email
                        </ThemedText>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            returnKeyType="next"
                            keyboardType="email-address"
                            placeholder="Email"
                            placeholderTextColor={"#B3B3B3"}
                            style={{
                                borderWidth: 1,
                                borderColor: Colors[colorScheme].border,
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                color: Colors[colorScheme].bg_light,
                            }}
                        />
                    </View>
                    <View style={{ gap: 4 }}>
                        <ThemedText
                            style={{ color: Colors[colorScheme].bg_light }}
                        >
                            Password
                        </ThemedText>
                        <View
                            style={{
                                position: "relative",
                            }}
                        >
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                                placeholder="Password"
                                secureTextEntry={isVisible ? false : true}
                                placeholderTextColor={"#B3B3B3"}
                                style={{
                                    borderWidth: 1,
                                    borderColor: Colors[colorScheme].border,
                                    borderRadius: 4,
                                    paddingHorizontal: 8,
                                    color: Colors[colorScheme].bg_light,
                                }}
                            />

                            <Pressable
                                style={{
                                    position: "absolute",
                                    top: 14,
                                    right: 14,
                                }}
                                onPress={() => setisVisible(!isVisible)}
                            >
                                {isVisible ? (
                                    <MaterialCommunityIcons
                                        size={16}
                                        name="eye-off"
                                        color={Colors[colorScheme].button_text}
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        size={16}
                                        name="eye"
                                        color={Colors[colorScheme].button_text}
                                    />
                                )}
                            </Pressable>
                        </View>
                    </View>
                    {error && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <MaterialCommunityIcons
                                size={14}
                                name="alert-circle-outline"
                                color={"hsl(352, 100%, 75%)"}
                            />
                            <ThemedText
                                style={{ color: "hsl(352, 100%, 75%)" }}
                            >
                                {error}
                            </ThemedText>
                        </View>
                    )}
                    <Link href={"/"}>
                        <ThemedText
                            type="body_medium"
                            style={{
                                textDecorationLine: "underline",
                                color: Colors[colorScheme].bg_dark,
                                textAlign: "right",
                            }}
                        >
                            Forgot your password?
                        </ThemedText>
                    </Link>
                </View>
                <Pressable
                    style={{
                        backgroundColor: Colors[colorScheme].tint,
                        paddingVertical: 12,
                        paddingHorizontal: 32,
                        borderRadius: 8,
                        width: "100%",
                    }}
                    onPress={() => handleLogin()}
                    disabled={isLoading}
                >
                    <ThemedText
                        emphasized
                        style={{
                            textAlign: "center",
                            color: Colors[colorScheme].button_text,
                        }}
                    >
                        {isLoading ? "Logging in..." : "Log in"}
                    </ThemedText>
                </Pressable>
            </ImageBackground>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({});

export default Login;
