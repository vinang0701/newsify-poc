import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?:
        | "default"
        | "defaultSemiBold"
        | "body_medium"
        | "heading"
        | "sub_heading"
        | "link"
        | "caption";
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = "default",
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
                type === "sub_heading" ? styles.sub_heading : undefined,
                type === "link" ? styles.link : undefined,
                style,
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
    heading: {
        fontSize: 32,
        fontWeight: "bold",
        lineHeight: 40,
    },
    sub_heading: {
        fontSize: 24,
        fontWeight: "bold",
        lineHeight: 32,
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
});
