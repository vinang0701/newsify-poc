import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Button,
    Pressable,
    useColorScheme,
    ImageBackground,
    Modal,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const ForgotPasswordSchema = z.object({
    email: z.email("Please enter a valid email address").toLowerCase().trim(),
});

const ForgotPassword = () => {
    const colorScheme = "light";
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof ForgotPasswordSchema>) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                data.email,
            );

            if (error) {
                // You could use form.setError here to show server errors on the input
                console.error(error.message);
            } else {
                router.push({
                    pathname: "/verify_otp",
                    params: { email: data.email },
                });
            }
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
                <View>
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].button_text}
                    />
                </View>
                {/* Prompt and Input */}
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        marginTop: "50%",
                        gap: 24,
                        width: "100%",
                    }}
                >
                    {/* Prompt */}
                    <View style={{ gap: 8 }}>
                        <ThemedText
                            type="heading"
                            style={{
                                textAlign: "center",
                                color: Colors[colorScheme].bg_light,
                            }}
                        >
                            Forgot password
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            style={{ color: Colors[colorScheme].bg_dark }}
                        >
                            Please enter your email address to receive an OTP.
                        </ThemedText>
                    </View>

                    <View style={{ gap: 4, width: "100%" }}>
                        <ThemedText
                            style={{ color: Colors[colorScheme].bg_light }}
                        >
                            Email
                        </ThemedText>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({
                                field: { onChange, onBlur, value },
                                fieldState: { error },
                            }) => (
                                <View>
                                    <TextInput
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        returnKeyType="send"
                                        keyboardType="email-address"
                                        placeholder="Email"
                                        placeholderTextColor={"#B3B3B3"}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: error
                                                ? "red"
                                                : Colors[colorScheme].border,
                                            borderRadius: 4,
                                            paddingHorizontal: 8,
                                            color: Colors[colorScheme].bg_light,
                                        }}
                                    />
                                    {/* Validation Message */}
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
                                                style={{
                                                    color: "hsl(352, 100%, 75%)",
                                                }}
                                            >
                                                {error.message}
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            )}
                        />
                    </View>
                    <Pressable
                        disabled={isLoading}
                        style={{
                            backgroundColor: isLoading
                                ? "#ccc"
                                : Colors[colorScheme].tint,
                            paddingVertical: 12,
                            paddingHorizontal: 32,
                            borderRadius: 8,
                            width: "100%",
                        }}
                        onPress={form.handleSubmit(onSubmit)}
                    >
                        <ThemedText
                            emphasized
                            style={{
                                textAlign: "center",
                                color: Colors[colorScheme].button_text,
                            }}
                        >
                            {isLoading ? "Sending..." : "Send OTP"}
                        </ThemedText>
                    </Pressable>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default ForgotPassword;

const styles = StyleSheet.create({
    modalView: {
        width: "100%",
        gap: 16,
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        elevation: 2,
    },
    textStyle: {
        textAlign: "center",
    },
    modalText: {
        fontWeight: "bold",
    },
    centeredView: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
});
