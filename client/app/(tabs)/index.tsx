import { Image } from "expo-image";
import * as React from "react";
import {
    ScrollView,
    StyleSheet,
    TouchableHighlight,
    useColorScheme,
    View,
} from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
} from "react-native-reanimated";
import Feather from "@expo/vector-icons/Feather";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/header";
import { useState, useEffect } from "react";
import newsArticles from "@/data/news.json";
import { Link } from "expo-router";

const HEADER_HEIGHT = 250;

type News = {
    author: string;
    title: string;
    desc: string;
    url: string;
    urlToImage: string;
    content: string;
};

// Substack like news feed
// avatar, name, time ago, 3 dots on the right
// title, image, preview text, read more
// like, comment, repost, save

export default function HomeScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const [news, setNews] = useState<News[]>([]);
    useEffect(() => {
        const fetchNews = () => {
            // try {
            //     const response = await fetch(
            //         "https://newsapi.org/v2/top-headlines?country=us&apiKey=3d96b466effb4a18aaf81eb8c202feda",
            //         {
            //             method: "GET",
            //             headers: {
            //                 Accept: "application/json",
            //                 "Content-Type": "application/json",
            //             },
            //         },
            //     );

            //     const json = await response.json();
            //     setNews(json.articles);
            // } catch (error) {
            //     console.error(error);
            // }
            newsArticles.articles.forEach((newsItem) => {
                news.push({
                    title: newsItem.title,
                    author: newsItem.author ?? "",
                    desc: newsItem.description ?? "",
                    url: newsItem.url ?? "",
                    urlToImage: newsItem.urlToImage ?? "",
                    content: newsItem.content ?? "",
                });
            });
        };
        fetchNews();
    }, [news]);
    return (
        <ScrollView>
            {news.map((newsItem, index) => {
                return (
                    <View
                        key={index}
                        style={[
                            styles.card,
                            {
                                backgroundColor: Colors[colorScheme].bg_dark,
                            },
                        ]}
                    >
                        <View style={styles.cardInfoContainer}>
                            <Image
                                source={require("@/assets/images/profile.png")}
                                style={{ width: 28, height: 28 }}
                            />
                            <ThemedText type="defaultSemiBold">
                                Author
                            </ThemedText>
                            <ThemedText
                                type="default"
                                style={{
                                    fontSize: 10,
                                    color: "hsl(0, 0%, 5%)",
                                }}
                            >
                                1d
                            </ThemedText>
                            <TouchableHighlight style={{ marginLeft: "auto" }}>
                                <Feather
                                    name="more-vertical"
                                    size={20}
                                    color={Colors[colorScheme].icon}
                                />
                            </TouchableHighlight>
                        </View>
                        <View>
                            {/* Content */}
                            <Image
                                alt="image"
                                source={{
                                    uri: newsItem.urlToImage,
                                }}
                                style={{
                                    width: "100%",
                                    height: 200,
                                    resizeMode: "cover",
                                }}
                            />
                            <ThemedText
                                type="title"
                                style={{
                                    paddingTop: 12,
                                    paddingHorizontal: 12,
                                    fontSize: 20,
                                }}
                            >
                                {newsItem.title}
                            </ThemedText>
                            <ThemedText
                                style={{
                                    paddingVertical: 4,
                                    paddingHorizontal: 12,
                                    fontSize: 14,
                                }}
                            >
                                {newsItem.content?.replace(
                                    /\s*\[\+\d+ chars\]$/,
                                    "",
                                )}
                                <Link href="/(tabs)/create-post">
                                    <ThemedText
                                        type="link"
                                        style={{ fontSize: 14 }}
                                    >
                                        Read More
                                    </ThemedText>
                                </Link>
                            </ThemedText>
                        </View>

                        <View style={styles.iconsContainer}>
                            {/* Interaction */}
                            <Feather name="heart" size={24} color="black" />
                            <SimpleLineIcons
                                name="bubble"
                                size={24}
                                color="black"
                            />
                            <Feather name="repeat" size={24} color="black" />
                            <Feather name="bookmark" size={24} color="black" />
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_HEIGHT,
        overflow: "hidden",
    },
    card: {
        flex: 1,
        gap: 8,
        alignContent: "flex-start",
        borderRadius: 8,
        paddingVertical: 24,
        marginBottom: 4,
        minHeight: 200,
    },
    cardInfoContainer: {
        flex: 1,
        gap: 8,
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 12,
    },

    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    iconsContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 8,
        paddingHorizontal: 12,
    },
});
