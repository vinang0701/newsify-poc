import {
    StyleSheet,
    View,
    TextInput,
    Pressable,
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
import { useForm, Controller, useWatch } from "react-hook-form";
import Feather from "@expo/vector-icons/Feather";
import { useAuthStore } from "@/utils/authStore";

const UpdatePasswordSchema = z
    .object({
        password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number")
            .regex(
                /[^A-Za-z0-9]/,
                "Must contain at least one special character",
            ),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Does not match password",
        path: ["confirmPassword"],
    });

type UpdatePasswordData = z.infer<typeof UpdatePasswordSchema>;

const UpdatePassword = () => {
    const colorScheme = "light";

    const [isVisible, setisVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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

    const watchedPassword = useWatch({ control, name: "password" }) || "";
    const rules = [
        { label: "Minimum 8 characters", valid: watchedPassword.length >= 8 },
        {
            label: "At least 1 uppercase letter",
            valid: /[A-Z]/.test(watchedPassword),
        },
        { label: "At least 1 number", valid: /[0-9]/.test(watchedPassword) },
        {
            label: "At least 1 special character",
            valid: /[^A-Za-z0-9]/.test(watchedPassword),
        },
    ];

    const onResetSubmit = async (data: UpdatePasswordData) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) {
                Alert.alert("Update Failed", error.message);
                return;
            }
            router.replace("/password_update_success");
        } catch (e) {
            console.error(e);
            Alert.alert(
                "An error occurred",
                "Unable to update password. Please check your connection and try again.",
            );
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
                            <View style={{ marginTop: 6, gap: 4 }}>
                                {rules.map((rule, index) => {
                                    // Determine styles dynamically based on whether criteria is fulfilled
                                    const iconName = rule.valid
                                        ? "check-circle-outline"
                                        : "alert-circle-outline";
                                    const textColor = rule.valid
                                        ? "hsl(145, 80%, 65%)" // Green if condition met
                                        : watchedPassword.length > 0
                                          ? "hsl(352, 100%, 75%)" // Red if user typed but it's wrong
                                          : "#B3B3B3"; // Neutral gray if input is completely empty

                                    return (
                                        <View
                                            key={index}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 6,
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                size={14}
                                                name={iconName}
                                                color={textColor}
                                            />
                                            <ThemedText
                                                type="body_small"
                                                style={{ color: textColor }}
                                            >
                                                {rule.label}
                                            </ThemedText>
                                        </View>
                                    );
                                })}
                            </View>
                            {/* {errors.password && (
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
                            )} */}
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
