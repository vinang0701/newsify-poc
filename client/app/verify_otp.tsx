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
    Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { Controller } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import OTPInput from "@/components/otp-input";
import { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const VerifyOTP = () => {
    const router = useRouter();
    const colorScheme = "light";
    const params = useLocalSearchParams<{ email: string }>();
    const email = params.email;
    const [otpValue, setOtpValue] = useState<string[]>([
        "",
        "",
        "",
        "",
        "",
        "",
    ]);
    const [otpError, setOtpError] = useState<string | null>(null);
    const handleOTPChange = (newValues: string[]) => {
        setOtpValue(newValues);
        setOtpError(null);
    };

    const handleConfirm = async () => {
        const otp = otpValue.join("");
        if (otp.length !== 6) {
            setOtpError("Please enter a complete OTP");
            return;
        }
        // Handle OTP verification here
        await handleVerifyOtp(otp, email);
        // Replace with your navigation logic
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleVerifyOtp = async (token: string, email: string) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "recovery",
        });

        if (error) {
            console.error("Verification failed:", error.message);
        }

        if (data?.session) {
            router.push("/update_password");
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
                    <View
                        style={{
                            flexDirection: "column",
                            width: "100%",
                            gap: 8,
                        }}
                    >
                        <ThemedText
                            type="heading"
                            style={{
                                textAlign: "center",
                                color: Colors[colorScheme].bg_light,
                            }}
                        >
                            Check you inbox
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            style={{
                                textAlign: "center",
                                color: Colors[colorScheme].bg_dark,
                            }}
                        >
                            We have sent you an OTP to
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            emphasized
                            style={{
                                textAlign: "center",
                                color: Colors[colorScheme].bg_dark,
                            }}
                        >
                            {email}
                        </ThemedText>
                    </View>

                    <View style={{ gap: 4, width: "100%" }}>
                        <OTPInput
                            value={otpValue}
                            onChange={handleOTPChange}
                            length={6}
                            disabled={isLoading}
                        />
                        {otpError && (
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
                                    {otpError}
                                </ThemedText>
                            </View>
                        )}
                        {/* <TextInput
                            returnKeyType="send"
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
                        /> */}
                    </View>
                    <Pressable
                        style={{
                            backgroundColor: Colors[colorScheme].tint,
                            paddingVertical: 12,
                            paddingHorizontal: 32,
                            borderRadius: 8,
                            width: "100%",
                        }}
                        onPress={() => handleConfirm()}
                    >
                        <ThemedText
                            emphasized
                            style={{
                                textAlign: "center",
                                color: Colors[colorScheme].button_text,
                            }}
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </ThemedText>
                    </Pressable>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default VerifyOTP;

const styles = StyleSheet.create({});
