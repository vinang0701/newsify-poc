import {
    Pressable,
    Text,
    useColorScheme,
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import Feather from "@expo/vector-icons/Feather";
import { supabase } from "@/lib/supabase";

type ProfileData = {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
    university?: string | null;
    major?: string | null;
    description?: string | null;
};

export default function Profile_Redacted() {
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const { inst_id } = useLocalSearchParams<{ inst_id?: string }>();

    const [menuVisible, setMenuVisible] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();

                if (userError) {
                    console.error("Error fetching user:", userError);
                    return;
                }

                setUser(user);

                if (!user?.id) return;

                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (profileError) {
                    console.error("Profile fetch error:", profileError);
                    return;
                }

                setProfile(profileData);
            } catch (error) {
                console.error("Unexpected profile fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const displayName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email ||
        "Guest User";

    const displayUniversity = profile?.university || "No university added";
    const displayMajor = profile?.major || "No major added";
    const displayDescription =
        profile?.description || "No profile description added.";

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {menuVisible && (
                    <Pressable
                        style={styles.overlay}
                        onPress={() => setMenuVisible(false)}
                    />
                )}

                <View
                    style={[
                        styles.headerContainer,
                        {
                            backgroundColor: Colors[colorScheme].tint,
                        },
                    ]}
                >
                    <Pressable onPress={() => router.back()}>
                        <Feather
                            name="arrow-left"
                            size={24}
                            color={Colors[colorScheme].button_text}
                        />
                    </Pressable>

                    <Image
                        source={require("@/assets/images/icon_light.png")}
                        style={{ width: 42, height: 20, resizeMode: "contain" }}
                    />

                    <Pressable onPress={() => {}}>
                        <Feather
                            name="search"
                            size={24}
                            color={Colors[colorScheme].button_text}
                        />
                    </Pressable>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={Colors[colorScheme].tint}
                        />
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View
                            style={[
                                styles.profileCardContainer,
                                { backgroundColor: Colors[colorScheme].bg_light },
                            ]}
                        >
                            <View style={styles.flexRowContainer}>
                                <View style={[styles.flexRowContainer, { gap: 20 }]}>
                                    <Image
                                        source={
                                            profile?.avatar_url
                                                ? { uri: profile.avatar_url }
                                                : require("@/assets/images/profile.png")
                                        }
                                        style={{ width: 68, height: 68, borderRadius: 34 }}
                                    />
                                    <View style={{ flexShrink: 1 }}>
                                        <ThemedText type="defaultSemiBold">
                                            {displayName}
                                        </ThemedText>
                                        <ThemedText
                                            type="caption"
                                            style={{
                                                color: Colors[colorScheme].caption,
                                            }}
                                        >
                                            {displayUniversity}
                                        </ThemedText>
                                        <ThemedText
                                            type="caption"
                                            style={{
                                                color: Colors[colorScheme].caption,
                                            }}
                                        >
                                            {displayMajor}
                                        </ThemedText>
                                    </View>
                                </View>

                                <View style={styles.menuAnchor}>
                                    <Pressable
                                        onPress={() => setMenuVisible((prev) => !prev)}
                                    >
                                        <MaterialCommunityIcons
                                            name="dots-vertical"
                                            size={24}
                                            color={Colors[colorScheme].text}
                                        />
                                    </Pressable>

                                    {menuVisible && (
                                        <View style={styles.menuContainer}>
                                            <Pressable
                                                style={styles.menuItem}
                                                onPress={() => {
                                                    setMenuVisible(false);

                                                    if (!inst_id) {
                                                        console.warn(
                                                            "No inst_id provided",
                                                        );
                                                        return;
                                                    }

                                                    router.push({
                                                        pathname: "/requests",
                                                        params: { inst_id },
                                                    });
                                                }}
                                            >
                                                <Feather
                                                    name="file-text"
                                                    size={16}
                                                    color="#111827"
                                                />
                                                <Text style={styles.menuText}>
                                                    View requests
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={styles.menuItem}
                                                onPress={() => {
                                                    setMenuVisible(false);
                                                }}
                                            >
                                                <Feather
                                                    name="bookmark"
                                                    size={16}
                                                    color="#111827"
                                                />
                                                <Text style={styles.menuText}>
                                                    View bookmarks
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={styles.menuItem}
                                                onPress={() => {
                                                    setMenuVisible(false);
                                                }}
                                            >
                                                <Feather
                                                    name="award"
                                                    size={16}
                                                    color="#111827"
                                                />
                                                <Text style={styles.menuText}>
                                                    View achievements
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                style={styles.menuItem}
                                                onPress={() => {
                                                    setMenuVisible(false);
                                                }}
                                            >
                                                <Feather
                                                    name="settings"
                                                    size={16}
                                                    color="#111827"
                                                />
                                                <Text style={styles.menuText}>
                                                    Change preference
                                                </Text>
                                            </Pressable>

                                            <View style={styles.menuDivider} />

                                            <Pressable
                                                style={styles.menuItem}
                                                onPress={() => {
                                                    setMenuVisible(false);
                                                }}
                                            >
                                                <Feather
                                                    name="log-out"
                                                    size={16}
                                                    color="#DC2626"
                                                />
                                                <Text
                                                    style={[
                                                        styles.menuText,
                                                        { color: "#DC2626" },
                                                    ]}
                                                >
                                                    Log out
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].caption,
                                    fontWeight: "700",
                                }}
                            >
                                {displayDescription}
                            </ThemedText>

                            <View
                                style={[styles.flexRowContainer, styles.statsContainer]}
                            >
                                <View style={styles.statsInfoContainer}>
                                    <ThemedText type="defaultSemiBold">
                                        0
                                    </ThemedText>
                                    <ThemedText
                                        type="caption"
                                        style={{
                                            color: Colors[colorScheme].caption,
                                            fontWeight: "500",
                                        }}
                                    >
                                        News Posts
                                    </ThemedText>
                                </View>
                                <View style={styles.statsInfoContainer}>
                                    <ThemedText type="defaultSemiBold">
                                        0
                                    </ThemedText>
                                    <ThemedText
                                        type="caption"
                                        style={{
                                            color: Colors[colorScheme].caption,
                                            fontWeight: "500",
                                        }}
                                    >
                                        Communities
                                    </ThemedText>
                                </View>
                                <View style={styles.statsInfoContainer}>
                                    <ThemedText type="defaultSemiBold">
                                        0
                                    </ThemedText>
                                    <ThemedText
                                        type="caption"
                                        style={{
                                            color: Colors[colorScheme].caption,
                                            fontWeight: "500",
                                        }}
                                    >
                                        Followers
                                    </ThemedText>
                                </View>
                                <View style={styles.statsInfoContainer}>
                                    <ThemedText type="defaultSemiBold">
                                        0
                                    </ThemedText>
                                    <ThemedText
                                        type="caption"
                                        style={{
                                            color: Colors[colorScheme].caption,
                                            fontWeight: "500",
                                        }}
                                    >
                                        Following
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    flexRowContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    profileCardContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    statsContainer: {
        paddingVertical: 8,
        justifyContent: "center",
        gap: 24,
    },
    statsInfoContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    menuAnchor: {
        position: "relative",
        zIndex: 20,
    },
    menuContainer: {
        position: "absolute",
        top: 28,
        right: 0,
        width: 185,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
    },
    menuText: {
        fontSize: 14,
        color: "#111827",
    },
    menuDivider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 4,
    },
});