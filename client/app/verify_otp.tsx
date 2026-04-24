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
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { Controller } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";

const VerifyOTP = () => {
    const router = useRouter();
    const colorScheme = "light";
    const params = useLocalSearchParams<{ email: string }>();
    const email = params.email;
    const handleVerifyOtp = async (token: string, email: string) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "recovery", // CRITICAL: This must be 'recovery' for password resets
        });

        if (error) {
            console.error("Verification failed:", error.message);
        } else {
            router.push("/update-password");
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
                            Check you inbox
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            style={{ color: Colors[colorScheme].bg_dark }}
                        >
                            We have sent you an OTP to
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            emphasized
                            style={{ color: Colors[colorScheme].bg_dark }}
                        >
                            {email}
                        </ThemedText>
                    </View>

                    <View style={{ gap: 4, width: "100%" }}>
                        <ThemedText
                            style={{ color: Colors[colorScheme].bg_light }}
                        >
                            Email
                        </ThemedText>

                        <TextInput
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
                        />
                    </View>
                    <Pressable
                        style={{
                            backgroundColor: Colors[colorScheme].tint,
                            paddingVertical: 12,
                            paddingHorizontal: 32,
                            borderRadius: 8,
                            width: "100%",
                        }}
                    >
                        <ThemedText
                            emphasized
                            style={{
                                textAlign: "center",
                                color: Colors[colorScheme].button_text,
                            }}
                        >
                            {/* {isLoading ? "Logging in..." : "Log in"} */}
                            Send OTP
                        </ThemedText>
                    </Pressable>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default VerifyOTP;

const styles = StyleSheet.create({});
