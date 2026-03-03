import { Heart } from "lucide-react-native";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";

import { Colors } from "@/constants/theme";

export default function ComponentsScreen() {
    const colorScheme = useColorScheme() ?? "light";
    return (
        // Button

        <ScrollView
            style={{
                flex: 1,
                height: "100%",
                backgroundColor: Colors[colorScheme].bg_dark,
                paddingHorizontal: 16,
            }}
        >
            <View
                id="buttonSection"
                style={[
                    styles.sectionContainer,
                    {
                        backgroundColor: Colors[colorScheme].bg,
                    },
                ]}
            >
                <ThemedText type="subtitle">Buttons</ThemedText>
                <View style={styles.btnCtn}>
                    <Pressable
                        onPress={() => console.warn("pressed")}
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed
                                    ? Colors[colorScheme].buttonPressed
                                    : Colors[colorScheme].tint,
                            },
                            styles.button,
                        ]}
                    >
                        <Text
                            style={[
                                {
                                    color: Colors[colorScheme].bg_dark,
                                    textAlign: "center",
                                    fontSize: 16,
                                    fontWeight: 700,
                                },
                            ]}
                        >
                            Log in
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => console.warn("pressed")}
                        style={({ pressed }) => [
                            styles.button,
                            {
                                padding: 0,
                                paddingHorizontal: 0,
                            },
                        ]}
                    >
                        <Heart />
                    </Pressable>
                    <Pressable
                        onPress={() => console.warn("pressed")}
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed
                                    ? Colors[colorScheme].buttonPressed
                                    : Colors[colorScheme].tint,
                            },
                            styles.button,
                        ]}
                    >
                        <Text
                            style={[
                                {
                                    color: Colors[colorScheme].bg_dark,
                                    textAlign: "center",
                                    fontSize: 16,
                                    fontWeight: 700,
                                },
                            ]}
                        >
                            Log in
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        flex: 1,
        minHeight: 200,
        padding: 12,
        marginTop: 8,
        borderRadius: 10,
    },

    btnCtn: {
        padding: 4,
        alignItems: "flex-start",
        gap: 16,
    },

    button: {
        width: "auto",
        padding: 4,
        paddingHorizontal: 8,
        textAlign: "center",
        justifyContent: "center",
        borderRadius: 4,
        boxShadow: [
            {
                offsetX: 0,
                offsetY: 4,
                blurRadius: 10,
                spreadDistance: 0,
                color: "rgba(255,255,255,0.8)",
                inset: false,
            },
        ],
    },
    elevation: {
        elevation: 20,
        shadowColor: "#333",
    },
});
