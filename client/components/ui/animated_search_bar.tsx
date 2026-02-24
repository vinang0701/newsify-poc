import Feather from "@expo/vector-icons/Feather";
import { Link } from "expo-router";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";

export default function AnimatedSearchBar() {
    const isSearchOpen = useSharedValue(false);
    const colorScheme = useColorScheme() ?? "light";

    return (
        <Link href="/" push asChild>
            <Pressable onPress={() => console.log("hello")}>
                <Animated.View style={[styles.searchBar]}>
                    <Feather name="search" size={24} />
                </Animated.View>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: "flex-start",
    },
    searchBar: {
        height: 40,

        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        overflow: "hidden",
    },
    leftContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    inputWrapper: {
        flex: 1,
        marginLeft: 8,
    },
    input: {
        flex: 1,
    },
});
