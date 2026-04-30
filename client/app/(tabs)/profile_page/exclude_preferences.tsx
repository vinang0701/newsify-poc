import {
    View,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Pressable,
    useColorScheme,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { usePreferences } from "@/hooks/usePreferences";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";

export default function ExcludePreferencesScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const { user, metadata } = useAuthStore();

    // Get the includeIds that were passed from Screen 1
    // useLocalSearchParams reads the params from the URL/navigation
    const { includeIds } = useLocalSearchParams<{ includeIds: string }>();

    // Parse the JSON string back into an array
    // e.g. '["uuid-1","uuid-2"]' → ["uuid-1", "uuid-2"]
    const includedIds: string[] = includeIds ? JSON.parse(includeIds) : [];

    // excluded = categories the user does NOT want to see
    const [excluded, setExcluded] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Reuse the same hook to get all categories
    // We only need categories and loading from it here
    const { categories, loading } = usePreferences();

    // Toggle exclude selection — same logic as include but for excluded list
    const toggleExclude = (id: string) => {
        setExcluded(
            (prev) =>
                prev.includes(id)
                    ? prev.filter((c) => c !== id) // remove if already excluded
                    : [...prev, id], // add if not excluded
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Get the currently logged in user
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Delete ALL existing preferences for this user
            // delete first to avoid duplicates
            await supabase
                .from("user_preferences")
                .delete()
                .eq("user_id", user.id);

            // Build the rows to insert
            // includedIds → preference_type = "include"
            // excluded    → preference_type = "exclude"
            const includeRows = includedIds.map((category_id) => ({
                user_id: user.id,
                category_id,
                preference_type: "include",
            }));

            const excludeRows = excluded.map((category_id) => ({
                user_id: user.id,
                category_id,
                preference_type: "exclude",
            }));

            // Insert both lists together in one call
            const { error } = await supabase
                .from("user_preferences")
                .insert([...includeRows, ...excludeRows]);

            if (error) throw error;

            // Go to the main feed
            router.replace("/(tabs)");
        } catch (err) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Build rows for include and exclude
            const includeRows = includedIds.map((category_id) => ({
                category_id: category_id,
                preference_type: "include",
            }));

            const excludeRows = excluded.map((id) => ({
                category_id: id,
                preference_type: "exclude",
            }));

            // Insert both lists together
            const combinedPreferences = [...includeRows, ...excludeRows];

            const response = await api.post(
                `/${metadata?.inst_id}/users/me/preferences`,
                {
                    preferences: combinedPreferences,
                },
            );
            if (response.data) {
                router.replace("/(tabs)/profile_page/[user_id]");
            }
        } catch (err) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator
                    size="large"
                    color={Colors[colorScheme].tint}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            {/* Header */}
            <View
                style={[
                    styles.headerContainer,
                    { backgroundColor: Colors[colorScheme].tint },
                ]}
            >
                {/* Back button goes back to Screen 1 */}
                <Pressable onPress={() => router.back()}>
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].button_text}
                    />
                </Pressable>
                <ThemedText
                    type="defaultSemiBold"
                    style={{ color: Colors[colorScheme].button_text }}
                >
                    Select Excluded Categories
                </ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <ThemedText type="defaultSemiBold" style={styles.title}>
                    What You Don't Want To See
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Choose what you do not want to appear on your news feed!
                </ThemedText>

                {/* Category chips — excluded ones show grey + strikethrough */}
                <View style={styles.grid}>
                    {categories.map((cat) => {
                        const isExcluded = excluded.includes(cat.category_id);
                        return (
                            <TouchableOpacity
                                key={cat.category_id}
                                style={[
                                    styles.chip,
                                    {
                                        // excluded = grey background
                                        // not excluded = transparent
                                        borderColor: isExcluded
                                            ? "#888"
                                            : Colors[colorScheme].tint,
                                        backgroundColor: isExcluded
                                            ? "#888"
                                            : "transparent",
                                    },
                                ]}
                                onPress={() => toggleExclude(cat.category_id)}
                            >
                                <ThemedText
                                    style={{
                                        color: isExcluded
                                            ? "#fff"
                                            : Colors[colorScheme].text,
                                        // strikethrough when excluded
                                        textDecorationLine: isExcluded
                                            ? "line-through"
                                            : "none",
                                    }}
                                >
                                    {cat.category_name}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Save button — saves both include and exclude lists */}
                <Pressable
                    style={[
                        styles.saveBtn,
                        {
                            backgroundColor: saving
                                ? "#ccc" // grey while saving
                                : Colors[colorScheme].tint, // normal color
                        },
                    ]}
                    onPress={handleSavePreferences}
                    disabled={saving} // prevent double tapping
                >
                    <ThemedText
                        style={{ color: Colors[colorScheme].button_text }}
                    >
                        {saving ? "Saving..." : "Save"}
                    </ThemedText>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    container: {
        padding: 20,
        gap: 12,
    },
    title: { fontSize: 20, marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 16, opacity: 0.6 },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    saveBtn: {
        marginTop: 24,
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
});
