import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import { Roboto_400Regular } from "@expo-google-fonts/roboto";

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?:
        | "default"
        | "defaultSemiBold"
        | "body_medium"
        | "body_small"
        | "heading"
        | "sub_heading"
        | "link"
        | "caption";
    emphasized?: false | true;
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = "default",
    emphasized = false,
    ...rest
}: ThemedTextProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

    return (
        <Text
            style={[
                { color },
                type === "default" ? styles.default : undefined,
                type === "heading" ? styles.heading : undefined,
                type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
                type === "body_medium" ? styles.body_medium : undefined,
                type === "body_small" ? styles.body_small : undefined,
                type === "sub_heading" ? styles.sub_heading : undefined,
                type === "link" ? styles.link : undefined,
                type === "caption" ? styles.caption : undefined,
                style,
                emphasized === true ? styles.emphasized : undefined,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        lineHeight: 24,
    },
    defaultSemiBold: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "600",
    },
    body_medium: {
        fontSize: 14,
        lineHeight: 20,
    },
    body_small: {
        fontSize: 12,
        lineHeight: 16,
    },

    heading: {
        fontSize: 32,
        fontWeight: "bold",
        lineHeight: 40,
    },
    sub_heading: {
        fontSize: 22,
        fontWeight: "700",
        lineHeight: 28,
    },
    caption: {
        fontSize: 11,
        lineHeight: 16,
    },
    link: {
        lineHeight: 30,
        fontSize: 16,
        color: "#0a7ea4",
    },
    emphasized: {
        fontWeight: 600,
    },
});
