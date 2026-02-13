import { View } from "react-native/Libraries/Components/View/View";
import {
    Alert,
    Button,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    useColorScheme,
} from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Colors } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ThemedView } from "./themed-view";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export function Header() {
    const colorScheme = useColorScheme() ?? "light";
    return (
        <SafeAreaView
            edges={["top"]}
            style={[
                styles.headerContainer,
                { backgroundColor: Colors[colorScheme].background },
            ]}
        >
            <TouchableOpacity>
                <MaterialIcons
                    name="menu"
                    size={24}
                    color={Colors[colorScheme].text}
                    weight="bold"
                />
            </TouchableOpacity>
            <TouchableOpacity>
                <SimpleLineIcons
                    name="magnifier"
                    size={24}
                    color={Colors[colorScheme].text}
                />
            </TouchableOpacity>
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
});
