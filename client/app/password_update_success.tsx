import {
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React from "react";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const password_update_success = () => {
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
                <Pressable onPress={() => router.replace("/login")}>
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={Colors["light"].button_text}
                    />
                </Pressable>
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        marginTop: "50%",
                        gap: 40,
                        width: "100%",
                    }}
                >
                    <View style={{ gap: 8 }}>
                        <ThemedText
                            type="heading"
                            style={{
                                textAlign: "center",
                                color: Colors["light"].bg_light,
                            }}
                        >
                            Success!
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            style={{ color: Colors["light"].bg_dark }}
                        >
                            You have successfully reset your password.
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            style={{ color: Colors["light"].bg_dark }}
                        >
                            You can now log in with you new password.
                        </ThemedText>
                    </View>
                    <Pressable
                        style={{
                            backgroundColor: Colors["light"].tint,
                            paddingVertical: 12,
                            paddingHorizontal: 32,
                            borderRadius: 8,
                            width: "100%",
                        }}
                        onPress={() => router.replace("/login")}
                    >
                        <ThemedText
                            emphasized
                            style={{
                                textAlign: "center",
                                color: Colors["light"].button_text,
                            }}
                        >
                            Back to login
                        </ThemedText>
                    </Pressable>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default password_update_success;

const styles = StyleSheet.create({});
