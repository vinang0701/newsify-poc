import {
    Pressable,
    StyleSheet,
    useColorScheme,
    View,
    ViewProps,
} from "react-native";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import { FlatList } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";

export interface EditorToolbarActions {
    onBold?: () => void;
    onItalic?: () => void;
    onUnderline?: () => void;
    onImage?: () => void;
    onLink?: () => void;
    onBulletList?: () => void;
    onOrderedList?: () => void;
}

interface EditorToolbarProps extends ViewProps {
    actions?: EditorToolbarActions;
    activeStyles?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
    };
}

const EditorToolbar = ({
    style,
    actions,
    activeStyles,
}: EditorToolbarProps) => {
    const colorScheme = useColorScheme() ?? "light";
    const color = Colors[colorScheme].text;
    const activeColor = Colors[colorScheme].tint; // or whatever your active color is
    const toolbarIcons = [
        { name: "bold", fn: actions?.onBold, iconSet: "feather" },
        { name: "italic", fn: actions?.onItalic, iconSet: "feather" },
        { name: "underline", fn: actions?.onUnderline, iconSet: "feather" },
        { name: "image", fn: actions?.onImage, iconSet: "feather" },
        { name: "link", fn: actions?.onLink, iconSet: "feather" },
        { name: "list", fn: actions?.onBulletList, iconSet: "feather" },
        {
            name: "format-list-numbered",
            fn: actions?.onOrderedList,
            iconSet: "mci",
        },
    ] as const;

    const ToolbarIcon = ({
        name,
        iconSet,
        color,
    }: {
        name: string;
        iconSet: "feather" | "mci";
        color: string;
    }) => {
        if (iconSet === "feather") {
            return <Feather name={name as any} size={20} color={color} />;
        }
        return (
            <MaterialCommunityIcons
                name={name as any}
                size={20}
                color={color}
            />
        );
    };
    return (
        <View style={[styles.container, style]}>
            <FlashList
                horizontal
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.toolbar}
                data={toolbarIcons}
                renderItem={(item) => (
                    <Pressable
                        key={item.item.name}
                        onPress={item.item.fn}
                        style={styles.iconButton}
                    >
                        <ToolbarIcon
                            name={item.item.name}
                            iconSet={item.item.iconSet}
                            color={color}
                        />
                    </Pressable>
                )}
            />
        </View>
    );
};

export default EditorToolbar;
const styles = StyleSheet.create({
    container: {
        alignSelf: "flex-start",
        width: "100%",
    },
    toolbar: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconButton: {
        marginHorizontal: 12, // controls spacing between icons
    },
});
{
    /* <Pressable onPress={actions?.onBold}>
                <Feather
                    name="bold"
                    size={16}
                    color={activeStyles?.bold ? activeColor : color}
                />
            </Pressable>
            <Pressable onPress={actions?.onItalic}>
                <Feather
                    name="italic"
                    size={16}
                    color={activeStyles?.italic ? activeColor : color}
                />
            </Pressable>
            <Pressable onPress={actions?.onUnderline}>
                <Feather
                    name="underline"
                    size={16}
                    color={activeStyles?.underline ? activeColor : color}
                />
            </Pressable>
            <Pressable onPress={actions?.onImage}>
                <Feather name="image" size={16} color={color} />
            </Pressable>
            <Pressable onPress={actions?.onLink}>
                <Feather name="link" size={16} color={color} />
            </Pressable>
            <Pressable onPress={actions?.onBulletList}>
                <Feather name="list" size={16} color={color} />
            </Pressable>
            <Pressable onPress={actions?.onOrderedList}>
                <MaterialCommunityIcons
                    name="format-list-numbered"
                    size={16}
                    color={color}
                />
            </Pressable> */
}
