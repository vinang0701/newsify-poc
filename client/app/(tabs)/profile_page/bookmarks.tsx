import {
    View,
    StyleSheet,
    Pressable,
    useColorScheme,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import Feather from "@expo/vector-icons/Feather";
import { useQuery } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import NewsPostCard from "@/components/news_post_card";
import { News } from "@/data/types";
import { supabase } from "@/lib/supabase";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const BASE_URL = "http://10.0.2.2:8000/api/v1";

export default function BookmarksScreen() {
    const colorScheme = useColorScheme() ?? "light";

    // Get current user
    const { data: currentUser } = useQuery({
        queryKey: ["current_user"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        },
    });

    // Fetch saved posts
    const { data: savedPosts, isLoading } = useQuery<News[]>({
        queryKey: ["saved_posts"],
        queryFn: async (): Promise<News[]> => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            const response = await fetch(`${BASE_URL}/users/me/saved`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Could not fetch saved posts");
            return await response.json();
        },
        enabled: !!currentUser?.id,
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
                {/* Header */}
                <View style={[styles.headerContainer, { backgroundColor: Colors[colorScheme].tint }]}>
                    <Pressable onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color={Colors[colorScheme].button_text} />
                    </Pressable>
                    <ThemedText type="defaultSemiBold" style={{ color: Colors[colorScheme].button_text }}>
                        Bookmarks
                    </ThemedText>
                    <View style={{ width: 24 }} />
                </View>

                {/* Content */}
                {isLoading ? (
                    <ActivityIndicator
                        size="large"
                        color={Colors[colorScheme].tint}
                        style={{ flex: 1 }}
                    />
                ) : savedPosts?.length === 0 ? (
                    // Empty state
                    <View style={styles.emptyContainer}>
                        <ThemedText type="defaultSemiBold" style={{ opacity: 0.4 }}>
                            No saved posts
                        </ThemedText>
                    </View>
                ) : (
                    <FlashList
                        data={savedPosts}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <NewsPostCard
                                news={item}
                                currentUserId={currentUser?.id}
                            />
                        )}
                    />
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
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
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});