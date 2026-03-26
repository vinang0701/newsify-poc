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

type ToolbarIconItem = {
    name: string;
    fn?: () => void;
    iconSet: "feather" | "mci";
    styleKey?: "bold" | "italic" | "underline"; // Only include the keys that exist in activeStyles
};

const EditorToolbar = ({
    style,
    actions,
    activeStyles,
}: EditorToolbarProps) => {
    const colorScheme = useColorScheme() ?? "light";
    const color = Colors[colorScheme].text;
    const activeColor = Colors[colorScheme].tint; // or whatever your active color is
    const toolbarIcons: ToolbarIconItem[] = [
        {
            name: "bold",
            fn: actions?.onBold,
            iconSet: "feather",
            styleKey: "bold",
        },
        {
            name: "italic",
            fn: actions?.onItalic,
            iconSet: "feather",
            styleKey: "italic",
        },
        {
            name: "underline",
            fn: actions?.onUnderline,
            iconSet: "feather",
            styleKey: "underline",
        },
        { name: "image", fn: actions?.onImage, iconSet: "feather" }, // styleKey is now validly undefined
        { name: "link", fn: actions?.onLink, iconSet: "feather" },
        {
            name: "list",
            fn: actions?.onBulletList,
            iconSet: "feather",
        },
        {
            name: "format-list-numbered",
            fn: actions?.onOrderedList,
            iconSet: "mci",
        },
    ];

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
            {toolbarIcons.map((item) => {
                const isActive = item.styleKey
                    ? activeStyles?.[item.styleKey as keyof typeof activeStyles]
                    : false;
                return (
                    <Pressable
                        key={item.name}
                        onPress={item.fn}
                        style={[
                            styles.iconButton,
                            // Optional: Add a subtle background when active
                            isActive && {
                                backgroundColor: "rgba(0,0,0,0.1)",
                            },
                        ]}
                    >
                        <ToolbarIcon
                            name={item.name}
                            iconSet={item.iconSet}
                            // 2. Apply the active color here
                            color={isActive ? activeColor : color}
                        />
                    </Pressable>
                );
            })}
            {/* <FlashList
                keyExtractor={(item) => item.name}
                horizontal
                contentContainerStyle={styles.toolbar}
                data={toolbarIcons}
                renderItem={({ item }) => {
                    const isActive = item.styleKey
                        ? activeStyles?.[
                              item.styleKey as keyof typeof activeStyles
                          ]
                        : false;
                    return (
                        <Pressable
                            key={item.name}
                            onPress={item.fn}
                            style={[
                                styles.iconButton,
                                // Optional: Add a subtle background when active
                                isActive && {
                                    backgroundColor: "rgba(0,0,0,0.1)",
                                },
                            ]}
                        >
                            <ToolbarIcon
                                name={item.name}
                                iconSet={item.iconSet}
                                // 2. Apply the active color here
                                color={isActive ? activeColor : color}
                            />
                        </Pressable>
                    );
                }}
            /> */}
        </View>
    );
};

export default EditorToolbar;
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    iconButton: {
        marginRight: 4, // controls spacing between icons
        borderRadius: 4,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
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
