import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Pressable,
    useColorScheme,
    Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context"; // respects phone notches
import { router } from "expo-router"; // used to navigate between screens
import { usePreferences } from "@/hooks/usePreferences"; // our custom hook above
import { Colors } from "@/constants/theme"; // your app's color palette
import { ThemedText } from "@/components/themed-text"; // your custom text component
import Feather from "@expo/vector-icons/Feather"; // icon library
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/utils/authStore";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/loading";

export default function PreferencesScreen() {
    const colorScheme = useColorScheme() ?? "light"; // get light/dark mode
    const { user, metadata } = useAuthStore();
    const queryClient = useQueryClient();

    // Pull everything we need from our custom hook
    const { categories, preferences, savePreferences, loading } =
        usePreferences();

    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        [],
    );

    useEffect(() => {
        if (!loading && preferences) {
            const ids = preferences.map((p) => p.category.category_id);
            setSelectedCategoryIds(ids);
        }
    }, [loading, preferences]);

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
        );
    };

    const isUnchanged = useMemo(() => {
        const initial = (preferences || []).map((p) => p).sort();
        const current = [...selectedCategoryIds].sort();
        return JSON.stringify(initial) === JSON.stringify(current);
    }, [preferences, selectedCategoryIds]);

    const handleSavePreferences = async () => {
        if (!user || !metadata) {
            console.error("No user data found.");
            return;
        }

        savePreferences(selectedCategoryIds, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["user_preferences"],
                });
                Alert.alert("Success", "Your preferences have been updated.");
            },
            onError: (err: any) => {
                console.log("Failed to save preferences: " + err.detail);
                Alert.alert("Error", "Failed to save preferences.");
            },
        });
    };

    // Show a loading state while fetching from DB
    if (!categories || !preferences) {
        return <Loading />;
    }

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            {loading && <Loading />}
            {/* Header bar at the top */}
            <View
                style={[
                    styles.headerContainer,
                    { backgroundColor: Colors[colorScheme].tint },
                ]}
            >
                {/* Back button - goes to previous screen */}
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
                    Select Preferred Catergories
                </ThemedText>
                {/* Empty view to center the title (balances the back button) */}
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <ThemedText type="defaultSemiBold" style={styles.title}>
                    Pick Your Interests
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Pick at least 3 categories you wish to see on your news
                    feed!
                </ThemedText>

                {/* The grid of category chips */}
                <View style={styles.grid}>
                    {/* Loop through every category and render a chip for each */}
                    {categories !== undefined &&
                        categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.category_id} // React needs a unique key for each item in a list
                                style={[
                                    styles.chip,
                                    {
                                        borderColor: Colors[colorScheme].tint,
                                        // if this category is selected → fill with tint color
                                        // if not selected → transparent background
                                        backgroundColor:
                                            selectedCategoryIds.includes(
                                                cat.category_id,
                                            )
                                                ? Colors[colorScheme].tint
                                                : "transparent",
                                    },
                                ]}
                                onPress={() => toggleCategory(cat.category_id)} // toggle on tap
                            >
                                <ThemedText
                                    style={{
                                        // selected = white text, unselected = default text color
                                        color: selectedCategoryIds.includes(
                                            cat.category_id,
                                        )
                                            ? Colors[colorScheme].button_text
                                            : Colors[colorScheme].text,
                                    }}
                                >
                                    {cat.category_name}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                </View>

                {/* Save button - disabled if nothing is selected */}
                <Pressable
                    style={[
                        styles.saveBtn,
                        {
                            backgroundColor:
                                selectedCategoryIds.length < 3 || isUnchanged
                                    ? Colors[colorScheme].bg_dark
                                    : Colors[colorScheme].tint,
                        },
                    ]}
                    onPress={handleSavePreferences}
                    disabled={selectedCategoryIds.length < 3 || isUnchanged} // cant save if nothing selected
                >
                    <ThemedText
                        emphasized
                        style={{ color: Colors[colorScheme].button_text }}
                    >
                        {loading ? "Saving..." : "Save"}
                    </ThemedText>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

// Styles - similar to CSS but written as a JS object
const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row", // lay children left to right
        justifyContent: "space-between", // spread them apart
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center", // vertically center them
    },
    container: {
        padding: 20,
        gap: 12, // space between children
    },
    title: { fontSize: 20, marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 16, opacity: 0.6 },
    grid: {
        flexDirection: "row", // lay chips left to right
        flexWrap: "wrap", // wrap to next line when row is full
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20, // makes it pill shaped
        borderWidth: 1.5,
    },
    saveBtn: {
        marginTop: 24,
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
});
