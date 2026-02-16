/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "hsl(221, 100%, 50%)";
const tintColorDark = "#fff";

export const Colors = {
    light: {
        text: "hsl(0, 0%, 5%)",
        text_light: "hsl(0, 0%, 10%)",
        bg_light: "hsl(0 0% 100%)",
        bg: "hsl(0, 0%, 95%)",
        bg_dark: "hsl(0 0% 90%)",
        tint: tintColorLight,
        icon: "#687076",
        tabIconDefault: "#687076",
        tabIconSelected: tintColorLight,
        buttonPressed: "hsl(221, 100%, 45%)",
    },
    dark: {
        text: "hsl(0, 0%, 95%)",
        text_light: "hsl(0, 0%, 100%)",
        bg_light: "hsl(200, 7%, 14%)",
        bg: "hsl(200, 7%, 9%)",
        bg_dark: "hsl(200, 7%, 4%)",
        tint: tintColorDark,
        icon: "#9BA1A6",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: tintColorDark,
        buttonPressed: "hsl(0 0% 90%)",
    },
};

export const Fonts = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: "system-ui",
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: "ui-serif",
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: "ui-rounded",
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: "ui-monospace",
    },
    default: {
        sans: "normal",
        serif: "serif",
        rounded: "normal",
        mono: "monospace",
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded:
            "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
