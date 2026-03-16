import { Colors } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
    Text,
    View,
    BackHandler,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useColorScheme,
} from "react-native";
import { Image } from "expo-image";
import { Link, usePathname, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

import React from "react";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

export function Header() {
    const colorScheme = useColorScheme() || "light";
    const path = usePathname();
    const router = useRouter();
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return (
        <View
            style={[
                styles.headerContainer,
                {
                    backgroundColor: Colors[colorScheme].tint,
                },
            ]}
        >
            <TouchableOpacity>
                <Feather
                    name="bell"
                    size={24}
                    color={Colors[colorScheme].button_text}
                    weight="bold"
                />
            </TouchableOpacity>

            <Image
                source={require("@/assets/images/icon_light.png")}
                style={{ width: 42, height: 20, resizeMode: "contain" }}
            />

            <Link href="/search" push asChild>
                <Pressable onPress={() => console.log("hello")}>
                    <Animated.View>
                        <Feather
                            name="search"
                            size={24}
                            color={Colors[colorScheme].button_text}
                        />
                    </Animated.View>
                </Pressable>
            </Link>
        </View>
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
    searchBar: {
        flex: 1,
        textAlignVertical: "center",
        justifyContent: "center",
        marginLeft: 8,
        borderRadius: 20,

        paddingLeft: 8,
    },
});
