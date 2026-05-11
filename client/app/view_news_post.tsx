import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import React from "react";
import { useAuthStore } from "@/utils/authStore";
import usePosts from "@/hooks/usePosts";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import Loading from "@/components/loading";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { openBrowserAsync } from "expo-web-browser";
import { EnrichedText } from "react-native-enriched";

const ViewNewsPostScreen = () => {
    const colorScheme = useColorScheme() ?? "light";
    const { user, metadata } = useAuthStore();
    const router = useRouter();
    const { news_id } = useLocalSearchParams<{ news_id: string }>();
    const insets = useSafeAreaInsets();

    const { postData: news, isLoading } = usePosts(news_id);

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            {/* {loading && <Loading />} */}
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
            </View>
            <ScrollView
                scrollEnabled={true}
                contentContainerStyle={{
                    backgroundColor: Colors[colorScheme].bg_light,
                    marginVertical: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    gap: 12,
                    paddingBottom: insets.bottom + 28,
                }}
            >
                <View style={[styles.cardInfoContainer]}>
                    {news?.community_id !== null ? (
                        <Pressable
                        // onPress={() =>
                        //     handleNavigateToComm(news.community_id)
                        // }
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                }}
                            >
                                <Image
                                    source={require("@/assets/images/profile.png")}
                                    style={{ width: 24, height: 24 }}
                                />
                                <ThemedText type="body_small" emphasized>
                                    {news?.community_name}
                                </ThemedText>
                            </View>
                        </Pressable>
                    ) : (
                        <Pressable
                        // onPress={() => handleNavigate(news.author_id)}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                }}
                            >
                                <Image
                                    source={require("@/assets/images/profile.png")}
                                    style={{ width: 24, height: 24 }}
                                />
                                <ThemedText type="body_small" emphasized>
                                    {news.author}
                                </ThemedText>
                            </View>
                        </Pressable>
                    )}

                    <ThemedText
                        type="caption"
                        style={{
                            color: Colors[colorScheme].text,
                        }}
                    >
                        {/* {timeAgo(news.created_at)} */}
                    </ThemedText>
                    <Pressable
                        style={{ marginLeft: "auto" }}

                        // onPress={() =>
                        //     handleSheetExpand(news.id, news.author_id)
                        // }
                    >
                        <Feather
                            name="more-vertical"
                            size={24}
                            color={Colors[colorScheme].icon}
                        />
                    </Pressable>
                </View>
                <View style={{ gap: 12 }}>
                    <ThemedText
                        type="sub_heading"
                        style={{
                            fontSize: 20,
                        }}
                    >
                        {news?.title}
                    </ThemedText>
                    {news?.image_url && (
                        <Image
                            alt="image"
                            source={{
                                uri: news?.image_url,
                            }}
                            style={{
                                width: "100%",
                                height: 200,
                                borderRadius: 8,
                                resizeMode: "cover",
                            }}
                        />
                    )}
                    <ThemedText
                        type="caption"
                        emphasized
                        style={{ color: Colors[colorScheme].text_light }}
                    >
                        {news?.created_at}
                    </ThemedText>
                </View>
                <View style={styles.iconsContainer}>
                    {/* Interaction */}
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            gap: 24,
                        }}
                    >
                        <Pressable
                            style={{
                                flex: 0,
                                flexDirection: "row",
                                gap: 4,
                                alignItems: "center",
                                justifyContent: "flex-start",
                            }}
                            // onPress={() => mu_toggleLikePost(news.id)}
                        >
                            {news?.has_liked ? (
                                <MaterialCommunityIcons
                                    name="heart"
                                    size={24}
                                    color="red"
                                />
                            ) : (
                                <MaterialCommunityIcons
                                    name="heart-outline"
                                    size={24}
                                    color="black"
                                />
                            )}

                            <ThemedText>{news?.likes_count}</ThemedText>
                        </Pressable>
                        {/* <Link href="/comment" push asChild> */}
                        <Pressable
                            style={{
                                flex: 0,
                                flexDirection: "row",
                                gap: 4,
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                            onPress={() =>
                                router.push({
                                    pathname: "/comment",
                                    params: { post_id: news?.id },
                                })
                            }
                        >
                            <Feather
                                name="message-square"
                                size={24}
                                color="black"
                            />
                            <ThemedText>{news?.comments_count}</ThemedText>
                        </Pressable>
                        {/* </Link> */}
                    </View>
                    <Pressable
                    // onPress={() => mu_toggleBookmark(news.id)}
                    // disabled={bookmarkLoading}
                    >
                        {news?.has_saved ? (
                            <MaterialCommunityIcons
                                name="bookmark"
                                size={24}
                                color={Colors[colorScheme].tint}
                            />
                        ) : (
                            <MaterialCommunityIcons
                                name="bookmark-outline"
                                size={24}
                                color="black"
                            />
                        )}
                    </Pressable>
                </View>
                <View style={{ flexGrow: 1 }}>
                    <EnrichedText style={{ color: Colors[colorScheme].text }}>
                        {news?.content as any}
                    </EnrichedText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ViewNewsPostScreen;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    cardInfoContainer: {
        flex: 1,
        gap: 8,
        alignItems: "center",
        flexDirection: "row",
    },
    iconsContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
});
