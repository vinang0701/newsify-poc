import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import newsArticles from "@/data/news.json";
import Feather from "@expo/vector-icons/Feather";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Text,
    Button,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableHighlight,
    useColorScheme,
    View,
    Modal,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { News } from "@/data/types";
import { Header } from "@/components/header";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import NewsPostCard from "@/components/news_post_card";
import CommentsModal from "@/components/comments_modal";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
const HEADER_HEIGHT = 250;

const DATA = [
    {
        id: "1",
        title: "Recent",
    },
    {
        id: "2",
        title: "Important",
    },
    {
        id: "3",
        title: "Following",
    },
];

// Substack like news feed
// avatar, name, time ago, 3 dots on the right
// title, image, preview text, read more
// like, comment, repost, save

type ItemProps = { title: string };
const FilterItem = ({ title }: ItemProps) => {
    const colorScheme = useColorScheme() ?? "light";

    return (
        <Pressable
            style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                backgroundColor: Colors[colorScheme].bg_light,
                borderRadius: 4,
                marginRight: 8,
            }}
        >
            <Text
                style={{
                    color: Colors[colorScheme].tint,
                }}
            >
                {title}
            </Text>
        </Pressable>
    );
};

export default function HomeScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const [news, setNews] = useState<News[]>([]);
    const [activeFilter, setActiveFilter] = useState("Recent");
    const snapPoints = useMemo(() => ["100%"], []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const handleExpandSheet = () => {
        bottomSheetRef.current?.expand();
    };

    const handleSheetChange = (index: number) => {
        if (index === -1) {
            navigation.getParent()?.setOptions({
                tabBarVisible: false,
            });
        }
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        ),
        [],
    );

    useEffect(() => {
        const fetchNews = () => {
            if (!newsArticles?.articles) return;

            const formattedNews = newsArticles.articles.map((newsItem) => ({
                title: newsItem.title,
                author: newsItem.author ?? "",
                desc: newsItem.description ?? "",
                url: newsItem.url ?? "",
                urlToImage: newsItem.urlToImage ?? "",
                content: newsItem.content ?? "",
            }));

            setNews(formattedNews);
        };
        fetchNews();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView
                edges={["top"]}
                style={[
                    {
                        flex: 1,
                        backgroundColor: Colors[colorScheme].bg_light,
                    },
                ]}
            >
                <Header />
                <ScrollView
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: Colors[colorScheme].bg,
                    }}
                >
                    <View>
                        <FlashList
                            keyExtractor={(item) => item.id}
                            horizontal
                            style={{ marginBottom: 12, elevation: 10 }}
                            data={DATA}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 4,
                                        backgroundColor:
                                            activeFilter === item.title
                                                ? Colors[colorScheme].tint
                                                : Colors[colorScheme].bg_light,
                                        borderColor: Colors[colorScheme].border,
                                        borderWidth: 1,
                                        marginRight: 8,
                                        borderRadius: 4,
                                    }}
                                    onPress={() => {
                                        // Check if active state is pressed
                                        if (activeFilter === item.title) {
                                            return;
                                        } else {
                                            setActiveFilter(item.title);
                                        }
                                    }}
                                >
                                    <ThemedText
                                        type="body_small"
                                        emphasized={true}
                                        style={{
                                            color:
                                                activeFilter === item.title
                                                    ? Colors[colorScheme]
                                                          .button_text
                                                    : Colors[colorScheme].tint,
                                        }}
                                    >
                                        {item.title}
                                    </ThemedText>
                                </Pressable>
                            )}
                        />
                    </View>
                    {news.map((newsItem, index) => {
                        return (
                            <NewsPostCard
                                news={newsItem}
                                key={index}
                                onCommentPress={handleExpandSheet}
                            />
                        );
                    })}
                </ScrollView>
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    backdropComponent={renderBackdrop}
                    snapPoints={snapPoints}
                    enablePanDownToClose
                    topInset={insets.top}
                    onChange={handleSheetChange}
                >
                    <CommentsModal />
                </BottomSheet>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_HEIGHT,
        overflow: "hidden",
    },
    bodyContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    card: {
        flex: 1,
        gap: 8,
        alignContent: "flex-start",
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 4,
        minHeight: 200,
    },
    cardInfoContainer: {
        flex: 1,
        gap: 8,
        marginBottom: 4,
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
        alignItems: "center",
        paddingTop: 8,
        paddingHorizontal: 12,
    },
});
