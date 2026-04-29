import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    Pressable,
    useColorScheme,
    ImageBackground,
    Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import Feather from "@expo/vector-icons/Feather";
import { useAuthStore } from "@/utils/authStore";

const UpdatePasswordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type UpdatePasswordData = z.infer<typeof UpdatePasswordSchema>;

const UpdatePassword = () => {
    const colorScheme = "light";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isVisible, setisVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    // 2. Initialize Hook Form
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<UpdatePasswordData>({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const signOut = useAuthStore((state) => state.signOut);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
            router.replace("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const onResetSubmit = async (data: UpdatePasswordData) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) {
                Alert.alert("Update Failed", error.message);
            } else {
                Alert.alert("Success", "Your password has been updated.", [
                    {
                        text: "OK",
                        onPress: async () => await handleSignOut(),
                    },
                ]);
            }
        } catch (e) {
            console.error(e);
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
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                }}
                resizeMode="cover"
            >
                {/* Header */}
                <Pressable onPress={() => router.back()}>
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].button_text}
                    />
                </Pressable>
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        marginTop: "50%",
                        gap: 24,
                        width: "100%",
                    }}
                >
                    <View style={{ gap: 8 }}>
                        <ThemedText
                            type="heading"
                            style={{
                                textAlign: "center",
                                color: Colors[colorScheme].bg_light,
                            }}
                        >
                            Reset password
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            style={{ color: Colors[colorScheme].bg_dark }}
                        >
                            Please enter a new password to reset your password.
                        </ThemedText>
                    </View>
                    <View style={{ width: "100%", gap: 12 }}>
                        {/* New Password Field */}
                        <View style={{ gap: 4 }}>
                            <ThemedText
                                style={{ color: Colors[colorScheme].bg_light }}
                            >
                                New password
                            </ThemedText>
                            <Controller
                                control={control}
                                name="password"
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <View
                                        style={{
                                            position: "relative",
                                        }}
                                    >
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            returnKeyType="next"
                                            placeholder="Minimum 8 characters"
                                            secureTextEntry={
                                                isVisible ? false : true
                                            }
                                            placeholderTextColor={"#B3B3B3"}
                                            style={{
                                                borderWidth: 1,
                                                borderColor:
                                                    Colors[colorScheme].border,
                                                borderRadius: 4,
                                                paddingHorizontal: 8,
                                                color: Colors[colorScheme]
                                                    .bg_light,
                                            }}
                                        />

                                        <Pressable
                                            style={{
                                                position: "absolute",
                                                top: 14,
                                                right: 14,
                                            }}
                                            onPress={() =>
                                                setisVisible(!isVisible)
                                            }
                                        >
                                            {isVisible ? (
                                                <MaterialCommunityIcons
                                                    size={16}
                                                    name="eye-off"
                                                    color={
                                                        Colors[colorScheme]
                                                            .button_text
                                                    }
                                                />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    size={16}
                                                    name="eye"
                                                    color={
                                                        Colors[colorScheme]
                                                            .button_text
                                                    }
                                                />
                                            )}
                                        </Pressable>
                                    </View>
                                )}
                            />
                            {errors.password && (
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
                                        type="body_small"
                                        style={styles.errorText}
                                    >
                                        {errors.password.message}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                        {/* Confirm Password Field */}
                        <View style={{ gap: 4 }}>
                            <ThemedText
                                style={{ color: Colors[colorScheme].bg_light }}
                            >
                                Confirm password
                            </ThemedText>
                            <Controller
                                control={control}
                                name="confirmPassword"
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <View
                                        style={{
                                            position: "relative",
                                        }}
                                    >
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            returnKeyType="done"
                                            placeholder="Repeat password"
                                            secureTextEntry={
                                                isVisible ? false : true
                                            }
                                            placeholderTextColor={"#B3B3B3"}
                                            style={{
                                                borderWidth: 1,
                                                borderColor:
                                                    Colors[colorScheme].border,
                                                borderRadius: 4,
                                                paddingHorizontal: 8,
                                                color: Colors[colorScheme]
                                                    .bg_light,
                                            }}
                                        />

                                        <Pressable
                                            style={{
                                                position: "absolute",
                                                top: 14,
                                                right: 14,
                                            }}
                                            onPress={() =>
                                                setisVisible(!isVisible)
                                            }
                                        >
                                            {isVisible ? (
                                                <MaterialCommunityIcons
                                                    size={16}
                                                    name="eye-off"
                                                    color={
                                                        Colors[colorScheme]
                                                            .button_text
                                                    }
                                                />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    size={16}
                                                    name="eye"
                                                    color={
                                                        Colors[colorScheme]
                                                            .button_text
                                                    }
                                                />
                                            )}
                                        </Pressable>
                                    </View>
                                )}
                            />
                            {errors.confirmPassword && (
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
                                        type="body_small"
                                        style={styles.errorText}
                                    >
                                        {errors.confirmPassword.message}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                    <Pressable
                        style={{
                            backgroundColor: Colors[colorScheme].tint,
                            paddingVertical: 12,
                            paddingHorizontal: 32,
                            borderRadius: 8,
                            width: "100%",
                        }}
                        onPress={handleSubmit(onResetSubmit)}
                        disabled={isLoading}
                    >
                        <ThemedText
                            emphasized
                            style={{
                                textAlign: "center",
                                color: Colors[colorScheme].button_text,
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Updating..." : "Reset password"}
                        </ThemedText>
                    </Pressable>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default UpdatePassword;

const styles = StyleSheet.create({
    errorText: {
        color: "hsl(352, 100%, 75%)",
    },
});
