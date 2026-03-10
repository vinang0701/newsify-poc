import { Image } from "expo-image";
import { StyleSheet } from "react-native";

import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function CreatePost() {
    return (
        <Animated.ScrollView>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="heading">Create Post!</ThemedText>
            </ThemedView>
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
});
