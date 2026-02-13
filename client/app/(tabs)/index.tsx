import { Image } from "expo-image";
import { ScrollView, StyleSheet, useColorScheme, View } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
} from "react-native-reanimated";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/header";
const HEADER_HEIGHT = 250;
export default function HomeScreen() {
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <ScrollView></ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_HEIGHT,
        overflow: "hidden",
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
});
