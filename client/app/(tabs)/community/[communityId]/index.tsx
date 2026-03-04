import {
    Text,
    Pressable,
    StyleSheet,
    useColorScheme,
    Image,
    View,
    ScrollView,
} from "react-native";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Colors } from "@/constants/theme";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedText } from "@/components/themed-text";
import { News } from "@/types";
import { FlashList } from "@shopify/flash-list";
import newsArticles from "@/data/news.json";

const HEADER_HEIGHT = 250;

export default function CommunityPage() {
    const colorScheme = useColorScheme() ?? "light";
    const { communityId } = useLocalSearchParams();
    const router = useRouter();
    const [news, setNews] = useState<News[]>([]);
    const snapPoints = useMemo(() => ["20%"], []);

    // ref
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleExpandSheet = () => bottomSheetRef.current?.expand();

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
            {/* Header */}
            <SafeAreaView>
                <View
                    style={[
                        styles.headerContainer,
                        {
                            backgroundColor: Colors[colorScheme].bg_light,
                        },
                    ]}
                >
                    <Pressable onPress={() => router.back()}>
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color={Colors[colorScheme].text}
                            weight="bold"
                        />
                    </Pressable>

                    <Text
                        style={{
                            fontSize: 24,
                            color: Colors[colorScheme].tint,
                        }}
                    >
                        N
                    </Text>

                    <Pressable onPress={handleExpandSheet}>
                        <MaterialCommunityIcons
                            name="dots-vertical"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                    </Pressable>
                </View>
            </SafeAreaView>
            {/* Content Container */}
            <ScrollView style={{ backgroundColor: Colors[colorScheme].bg }}>
                {/* Community Info */}
                <View
                    style={{
                        backgroundColor: Colors[colorScheme].bg_dark,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        gap: 8,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            justifyContent: "space-between",
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <Image
                                source={require("@/assets/images/icon.png")}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderWidth: 1,
                                    borderColor: Colors[colorScheme].border,
                                    borderRadius: 100,
                                }}
                            />
                            {/* Community name and Member Count */}
                            <View>
                                <ThemedText type="defaultSemiBold">
                                    Chess Club
                                </ThemedText>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    30k members
                                </ThemedText>
                            </View>
                        </View>
                        {/* Join Button */}
                        <Pressable>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].button_text,
                                    backgroundColor: Colors[colorScheme].tint,
                                    paddingVertical: 4,
                                    paddingHorizontal: 12,
                                    borderRadius: 20,
                                }}
                            >
                                Join
                            </ThemedText>
                        </Pressable>
                    </View>
                    <ThemedText
                        type="caption"
                        style={{
                            color: Colors[colorScheme].caption,
                        }}
                    >
                        All about the game of chess, including discussions on
                        professional tournaments, game analysis and theory.
                    </ThemedText>
                </View>

                <View
                    style={{
                        flex: 1,
                        backgroundColor: Colors[colorScheme].bg,
                        paddingHorizontal: 16,
                    }}
                >
                    <View
                        style={[
                            {
                                alignSelf: "flex-start",
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 4,
                                borderWidth: 1,
                                borderColor: Colors[colorScheme].border,
                                backgroundColor: Colors[colorScheme].bg_light,
                                marginVertical: 12,
                            },
                        ]}
                    >
                        <ThemedText>Sort</ThemedText>
                        <MaterialCommunityIcons name="chevron-down" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <FlashList
                            scrollEnabled={false}
                            data={news}
                            renderItem={({ item, index }) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.card,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].bg_light,
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
                                        <Pressable
                                            style={{ marginLeft: "auto" }}
                                        >
                                            <Feather
                                                name="more-vertical"
                                                size={20}
                                                color={Colors[colorScheme].icon}
                                            />
                                        </Pressable>
                                    </View>
                                    <View>
                                        {/* Content */}
                                        <Image
                                            alt="image"
                                            source={{
                                                uri: item.urlToImage,
                                            }}
                                            style={{
                                                width: "100%",
                                                height: 200,
                                                objectFit: "contain",
                                            }}
                                        />
                                        <ThemedText
                                            type="sub_heading"
                                            style={{
                                                paddingTop: 12,
                                                paddingHorizontal: 12,
                                                fontSize: 20,
                                            }}
                                        >
                                            {item.title}
                                        </ThemedText>
                                        <ThemedText
                                            style={{
                                                paddingVertical: 4,
                                                paddingHorizontal: 12,
                                                fontSize: 14,
                                            }}
                                        >
                                            {item.content?.replace(
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
                                                    justifyContent:
                                                        "flex-start",
                                                }}
                                            >
                                                <Feather
                                                    name="heart"
                                                    size={24}
                                                    color="black"
                                                />
                                                <Text>100</Text>
                                            </Pressable>
                                            <Pressable
                                                style={{
                                                    flex: 0,
                                                    flexDirection: "row",
                                                    gap: 4,
                                                    justifyContent:
                                                        "flex-start",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Feather
                                                    name="message-square"
                                                    size={24}
                                                    color="black"
                                                />
                                                <Text>100</Text>
                                            </Pressable>
                                            <Pressable
                                                style={{
                                                    flex: 0,
                                                    flexDirection: "row",
                                                    justifyContent:
                                                        "flex-start",
                                                    gap: 4,
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Feather
                                                    name="repeat"
                                                    size={24}
                                                    color="black"
                                                />
                                                <Text>100</Text>
                                            </Pressable>
                                        </View>
                                        <Feather
                                            name="bookmark"
                                            size={24}
                                            color="black"
                                        />
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </ScrollView>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
            >
                <BottomSheetView style={styles.bottomSheet}>
                    <Pressable style={styles.modalActionButtonCtn}>
                        <MaterialCommunityIcons
                            name="help-circle-outline"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">About</ThemedText>
                    </Pressable>
                    <Pressable style={styles.modalActionButtonCtn}>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">Report</ThemedText>
                    </Pressable>
                    <Pressable style={styles.modalActionButtonCtn}>
                        <MaterialCommunityIcons
                            name="plus"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                        <ThemedText type="defaultSemiBold">Join</ThemedText>
                    </Pressable>
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_HEIGHT,
        overflow: "hidden",
    },
    headerContainer: {
        flex: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
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
    bottomSheet: {
        flex: 0,
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 24,
    },
    modalActionButtonCtn: {
        flex: 0,
        flexDirection: "row",
        gap: 8,
    },
});
