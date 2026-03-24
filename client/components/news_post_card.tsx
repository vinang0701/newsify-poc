import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useColorScheme,
} from "react-native";
import React from "react";
import { Colors } from "@/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { ThemedText } from "./themed-text";
import { ModalProps, News } from "@/data/types";

type NewsPostCardProps = {
    news: News;
};

function NewsPostCard({ news }: NewsPostCardProps) {
    const colorScheme = useColorScheme() ?? "light";

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
                <Image
                    source={require("@/assets/images/profile.png")}
                    style={{ width: 28, height: 28 }}
                />
                <ThemedText type="defaultSemiBold">{news.author}</ThemedText>
                <ThemedText
                    type="default"
                    style={{
                        fontSize: 10,
                        color: "hsl(0, 0%, 5%)",
                    }}
                >
                    1d
                </ThemedText>
                <Pressable style={{ marginLeft: "auto" }}>
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
                        uri: news.image_url,
                    }}
                    style={{
                        width: "100%",
                        height: 200,
                        resizeMode: "contain",
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
                    <Link href="/(tabs)/create">
                        <ThemedText type="link" style={{ fontSize: 14 }}>
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
                            justifyContent: "flex-start",
                        }}
                    >
                        <Feather name="heart" size={24} color="black" />
                        <Text>100</Text>
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
                            <Text>100</Text>
                        </Pressable>
                    </Link>
                </View>
                <Feather name="bookmark" size={24} color="black" />
            </View>
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
});

export default NewsPostCard;
