import {
    Pressable,
    Text,
    useColorScheme,
    View,
    StyleSheet,
    ScrollView,
} from "react-native";
import React, { Component } from "react";
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import Feather from "@expo/vector-icons/Feather";

export default function Profile() {
    const colorScheme = useColorScheme() ?? "light";

    return (
        <SafeAreaView>
            {/* Header */}
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
                        name="bell-outline"
                        size={24}
                        color={Colors[colorScheme].text}
                        weight="bold"
                    />
                </Pressable>

                <Image
                    source={require("@/assets/images/icon.png")}
                    style={{ width: 42, height: 20, resizeMode: "contain" }}
                />

                <Pressable onPress={() => {}}>
                    <MaterialCommunityIcons
                        name="magnify"
                        size={24}
                        color={Colors[colorScheme].text}
                    />
                </Pressable>
            </View>
            {/* Content */}
            <ScrollView >
                {/* User Profile Card */}
                <View
                    style={[
                        styles.profileCardContainer,
                        { backgroundColor: Colors[colorScheme].bg_light },
                    ]}
                >
                    <View style={styles.flexRowContainer}>
                        <View style={[styles.flexRowContainer, { gap: 20 }]}>
                            <Image
                                source={require("@/assets/images/profile.png")}
                                style={{ width: 68, height: 68 }}
                            />
                            <View>
                                <ThemedText type="defaultSemiBold">
                                    John Lee
                                </ThemedText>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    University of Wollongong
                                </ThemedText>
                                <ThemedText
                                    type="caption"
                                    style={{
                                        color: Colors[colorScheme].caption,
                                    }}
                                >
                                    Computer Science
                                </ThemedText>
                            </View>
                        </View>
                        <Pressable>
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                        </Pressable>
                    </View>
                    <ThemedText
                        type="caption"
                        style={{
                            color: Colors[colorScheme].caption,
                            fontWeight: 700,
                        }}
                    >
                        Studying Computer Science, but also passionate about
                        writing and sharing school stories.
                    </ThemedText>
                    <View
                        style={[styles.flexRowContainer, styles.statsContainer]}
                    >
                        <View style={styles.statsInfoContainer}>
                            <ThemedText type="defaultSemiBold">88</ThemedText>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].caption,
                                    fontWeight: "500",
                                }}
                            >
                                News Posts
                            </ThemedText>
                        </View>
                        <View style={styles.statsInfoContainer}>
                            <ThemedText type="defaultSemiBold">4</ThemedText>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].caption,
                                    fontWeight: "500",
                                }}
                            >
                                Communities
                            </ThemedText>
                        </View>
                        <View style={styles.statsInfoContainer}>
                            <ThemedText type="defaultSemiBold">168</ThemedText>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].caption,
                                    fontWeight: "500",
                                }}
                            >
                                Followers
                            </ThemedText>
                        </View>
                        <View style={styles.statsInfoContainer}>
                            <ThemedText type="defaultSemiBold">28</ThemedText>
                            <ThemedText
                                type="caption"
                                style={{
                                    color: Colors[colorScheme].caption,
                                    fontWeight: "500",
                                }}
                            >
                                Following
                            </ThemedText>
                        </View>
                    </View>
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
                            styles.sortButtonContainer,
                            {
                                borderColor: Colors[colorScheme].border,
                                backgroundColor: Colors[colorScheme].bg_light,
                            },
                        ]}
                    >
                        <ThemedText>Sort</ThemedText>
                        <MaterialCommunityIcons
                            name="chevron-down"
                            size={16}
                            color={Colors[colorScheme].text}
                        />
                    </View>
                    {/* Card */}
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: Colors[colorScheme].bg_light,
                                borderColor: Colors[colorScheme].border,
                            },
                        ]}
                    >
                        <View style={styles.flexRowContainer}>
                            <View style={[styles.flexRowContainer, { gap: 8 }]}>
                                <Image
                                    source={require("@/assets/images/favicon.png")}
                                    style={{
                                        height: 28,
                                        width: 28,
                                        borderRadius: 100,
                                        borderWidth: 1,
                                        borderColor: Colors[colorScheme].border,
                                        resizeMode: "contain",
                                    }}
                                />
                                <ThemedText type="defaultSemiBold">
                                    John Lee
                                </ThemedText>
                            </View>
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                        </View>
                        <Image
                            source={require("@/assets/images/favicon.png")}
                            style={{
                                height: 200,
                                width: "100%",
                                resizeMode: "contain",
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: "transparent",
                            }}
                        />

                        <ThemedText type="sub_heading">
                            Campus Vibes at the 2026 Campus Fair
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            style={{ color: Colors[colorScheme].caption }}
                        >
                            Enjoy food, games and live performances at the 2026
                            Campus fair on the SIM Campus!
                        </ThemedText>
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
                                <Pressable
                                    style={{
                                        flex: 0,
                                        flexDirection: "row",
                                        justifyContent: "flex-start",
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
                            <Feather name="bookmark" size={24} color="black" />
                        </View>
                    </View>
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: Colors[colorScheme].bg_light,
                                borderColor: Colors[colorScheme].border,
                            },
                        ]}
                    >
                        <View style={styles.flexRowContainer}>
                            <View style={[styles.flexRowContainer, { gap: 8 }]}>
                                <Image
                                    source={require("@/assets/images/favicon.png")}
                                    style={{
                                        height: 28,
                                        width: 28,
                                        borderRadius: 100,
                                        borderWidth: 1,
                                        borderColor: Colors[colorScheme].border,
                                        resizeMode: "contain",
                                    }}
                                />
                                <ThemedText type="defaultSemiBold">
                                    John Lee
                                </ThemedText>
                            </View>
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                        </View>
                        <Image
                            source={require("@/assets/images/favicon.png")}
                            style={{
                                height: 200,
                                width: "100%",
                                resizeMode: "contain",
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: "transparent",
                            }}
                        />

                        <ThemedText type="sub_heading">
                            Campus Vibes at the 2026 Campus Fair
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            style={{ color: Colors[colorScheme].caption }}
                        >
                            Enjoy food, games and live performances at the 2026
                            Campus fair on the SIM Campus!
                        </ThemedText>
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
                                <Pressable
                                    style={{
                                        flex: 0,
                                        flexDirection: "row",
                                        justifyContent: "flex-start",
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
                            <Feather name="bookmark" size={24} color="black" />
                        </View>
                    </View>
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: Colors[colorScheme].bg_light,
                                borderColor: Colors[colorScheme].border,
                            },
                        ]}
                    >
                        <View style={styles.flexRowContainer}>
                            <View style={[styles.flexRowContainer, { gap: 8 }]}>
                                <Image
                                    source={require("@/assets/images/favicon.png")}
                                    style={{
                                        height: 28,
                                        width: 28,
                                        borderRadius: 100,
                                        borderWidth: 1,
                                        borderColor: Colors[colorScheme].border,
                                        resizeMode: "contain",
                                    }}
                                />
                                <ThemedText type="defaultSemiBold">
                                    John Lee
                                </ThemedText>
                            </View>
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                        </View>
                        <Image
                            source={require("@/assets/images/favicon.png")}
                            style={{
                                height: 200,
                                width: "100%",
                                resizeMode: "contain",
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: "transparent",
                            }}
                        />

                        <ThemedText type="sub_heading">
                            Campus Vibes at the 2026 Campus Fair
                        </ThemedText>
                        <ThemedText
                            type="body_medium"
                            style={{ color: Colors[colorScheme].caption }}
                        >
                            Enjoy food, games and live performances at the 2026
                            Campus fair on the SIM Campus!
                        </ThemedText>
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
                                <Pressable
                                    style={{
                                        flex: 0,
                                        flexDirection: "row",
                                        justifyContent: "flex-start",
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
                            <Feather name="bookmark" size={24} color="black" />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flex: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    flexRowContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    profileCardContainer: {
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    statsContainer: {
        paddingVertical: 8,
        justifyContent: "center",
        gap: 24,
    },
    statsInfoContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    sortButtonContainer: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        marginVertical: 12,
    },
    card: {
        flex: 1,
        gap: 8,
        alignContent: "flex-start",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        marginBottom: 4,
        minHeight: 200,
        elevation: 2,
    },

    iconsContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 8,
    },
});
