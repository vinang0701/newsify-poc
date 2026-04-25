import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useColorScheme,
    Modal,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "./themed-text";
import { News } from "@/data/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type NewsPostCardProps = {
    news: News;
    inst_id: string;
};

function NewsPostCard({ news, inst_id }: NewsPostCardProps) {
    const colorScheme = useColorScheme() ?? "light";
    const [like, setLike] = useState(false);
    const [bookmark, setBookmark] = useState(false);
    const [likeCount, setLikeCount] = useState(20);
    const [menuVisible, setMenuVisible] = useState(false);
    const router = useRouter();

    function handleNavigate(user_id: string) {
        console.log(user_id);
        router.push({
            pathname: "/(tabs)/profile_page/[user_id]",
            params: { user_id: user_id },
        });
    }

    function handleLike() {
        setLike(!like);
        if (!like) {
            setLikeCount(likeCount + 1);
        } else {
            setLikeCount(20);
        }
    }

    function handleReportPost() {
        console.log("REPORT POST ID:", news.id);
        console.log("REPORT INST ID:", inst_id);
        setMenuVisible(false);

        router.push({
            pathname: "/report-post",
            params: {
                post_id: news.id,
                inst_id: inst_id,
            },
        });
    }

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: Colors[colorScheme].bg_light,
                    borderColor: Colors[colorScheme].border,
                },
            ]}
        >
            <View style={styles.cardInfoContainer}>
                <Pressable onPress={() => handleNavigate(news.author_id)}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                        }}
                    >
                        <Image
                            source={require("@/assets/images/profile.png")}
                            style={{ width: 28, height: 28 }}
                        />
                        <ThemedText type="defaultSemiBold">
                            {news.author}
                        </ThemedText>
                    </View>
                </Pressable>

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
                    onPress={() => setMenuVisible(true)}
                >
                    <Feather
                        name="more-vertical"
                        size={20}
                        color={Colors[colorScheme].icon}
                    />
                </Pressable>
            </View>

            <View>
                <Image
                    alt="image"
                    source={{
                        uri: news.image_url,
                    }}
                    style={{
                        width: "100%",
                        height: 200,
                        resizeMode: "cover",
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
                    {news.title}
                </ThemedText>

                <ThemedText
                    style={{
                        paddingVertical: 4,
                        paddingHorizontal: 12,
                        fontSize: 14,
                    }}
                >
                    {news.content["text"]?.replace(/\s*\[\+\d+ chars\]$/, "") ||
                        ""}
                </ThemedText>
            </View>

            <View style={styles.iconsContainer}>
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
                        onPress={() => handleLike()}
                    >
                        {like ? (
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

                        <ThemedText>{likeCount}</ThemedText>
                    </Pressable>

                    <Link href="/comment" push asChild>
                        <Pressable
                            style={{
                                flex: 0,
                                flexDirection: "row",
                                gap: 4,
                                justifyContent: "flex-start",
                                alignItems: "center",
                            }}
                        >
                            <Feather
                                name="message-square"
                                size={24}
                                color="black"
                            />
                            <ThemedText>3</ThemedText>
                        </Pressable>
                    </Link>
                </View>

                <Pressable onPress={() => setBookmark(!bookmark)}>
                    {bookmark ? (
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

            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setMenuVisible(false)}
                >
                    <View
                        style={[
                            styles.menuContainer,
                            {
                                backgroundColor: Colors[colorScheme].bg_light,
                            },
                        ]}
                    >
                        <Pressable
                            style={styles.menuItem}
                            onPress={handleReportPost}
                        >
                            <Feather
                                name="flag"
                                size={18}
                                color={Colors[colorScheme].alert_red || "#EF1238"}
                            />
                            <Text
                                style={[
                                    styles.menuText,
                                    {
                                        color:
                                            Colors[colorScheme].alert_red ||
                                            "#EF1238",
                                    },
                                ]}
                            >
                                Report post
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        gap: 8,
        alignContent: "flex-start",
        borderRadius: 8,
        borderWidth: 1,
        elevation: 2,
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
    iconsContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 8,
        paddingHorizontal: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    menuContainer: {
        width: "100%",
        borderRadius: 10,
        paddingVertical: 8,
        elevation: 5,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuText: {
        fontSize: 14,
        fontWeight: "600",
    },
});

export default NewsPostCard;