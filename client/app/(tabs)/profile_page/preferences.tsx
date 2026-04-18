import {
    View,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Pressable,
    useColorScheme,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context"; // respects phone notches
import { router } from "expo-router"; // used to navigate between screens
import { usePreferences } from "@/hooks/usePreferences"; // our custom hook above
import { Colors } from "@/constants/theme"; // your app's color palette
import { ThemedText } from "@/components/themed-text"; // your custom text component
import Feather from "@expo/vector-icons/Feather"; // icon library

export default function PreferencesScreen() {
    const colorScheme = useColorScheme() ?? "light"; // get light/dark mode
    
    // Pull everything we need from our custom hook
    const { categories, selected, toggleCategory, savePreferences, loading } =
        usePreferences();

    // Runs when user taps "Save Preferences"
    const handleSave = async () => {
        const success = await savePreferences(); // call the hook's save function
        if (success) {
            Alert.alert("Saved!", "Your preferences have been updated.");
            router.back(); // go back to previous screen
        } else {
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

    // Show a loading state while fetching from DB
    if (loading) {
        return (
            <SafeAreaView>
                <ThemedText>Loading...</ThemedText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            {/* Header bar at the top */}
            <View style={[styles.headerContainer, { backgroundColor: Colors[colorScheme].tint }]}>
                {/* Back button - goes to previous screen */}
                <Pressable onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={Colors[colorScheme].button_text} />
                </Pressable>
                <ThemedText type="defaultSemiBold" style={{ color: Colors[colorScheme].button_text }}>
                    My Interests
                </ThemedText>
                {/* Empty view to center the title (balances the back button) */}
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <ThemedText type="defaultSemiBold" style={styles.title}>
                    What are you interested in?
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Pick topics you want to see in your news feed.
                </ThemedText>

                {/* The grid of category chips */}
                <View style={styles.grid}>
                    {/* Loop through every category and render a chip for each */}
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.category_id} // React needs a unique key for each item in a list
                            style={[
                                styles.chip,
                                {
                                    borderColor: Colors[colorScheme].tint,
                                    // if this category is selected → fill with tint color
                                    // if not selected → transparent background
                                    backgroundColor: selected.includes(cat.category_id)
                                        ? Colors[colorScheme].tint
                                        : "transparent",
                                },
                            ]}
                            onPress={() => toggleCategory(cat.category_id)} // toggle on tap
                        >
                            <ThemedText
                                style={{
                                    // selected = white text, unselected = default text color
                                    color: selected.includes(cat.category_id)
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
                    style={[styles.saveBtn, { backgroundColor: Colors[colorScheme].tint }]}
                    onPress={handleSave}
                    disabled={selected.length === 0} // cant save if nothing selected
                >
                    <ThemedText style={{ color: Colors[colorScheme].button_text }}>
                        Save Preferences
                    </ThemedText>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

// Styles - similar to CSS but written as a JS object
const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",        // lay children left to right
        justifyContent: "space-between", // spread them apart
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",        // vertically center them
    },
    container: {
        padding: 20,
        gap: 12,                     // space between children
    },
    title: { fontSize: 20, marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 16, opacity: 0.6 },
    grid: {
        flexDirection: "row",        // lay chips left to right
        flexWrap: "wrap",            // wrap to next line when row is full
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,            // makes it pill shaped
        borderWidth: 1.5,
    },
    saveBtn: {
        marginTop: 24,
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
});