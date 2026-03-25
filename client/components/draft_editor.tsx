import React, { useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
    Button,
    useColorScheme,
    TextInput,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EnrichedTextInput } from "react-native-enriched";
import type {
    EnrichedTextInputInstance,
    OnChangeStateEvent,
} from "react-native-enriched";
import { Colors } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import EditorToolbar from "@/components/editor_toolbar";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";

type SelectedText = {
    start: number;
    end: number;
    text: string;
};

const DraftEditor = () => {
    const ref = useRef<EnrichedTextInputInstance>(null);
    const [image, setImage] = useState<string | null>(null);
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    const [selectedText, setSelectedText] = useState<SelectedText>();

    function handleSelectedText(start: number, end: number, text: string) {
        setSelectedText({ start, end, text });
    }

    const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>();
    const pickImage = async () => {
        // No permissions request is necessary for launching the image library.
        // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
        // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
        // so the app users aren't surprised by a system dialog after picking a video.
        // See "Invoke permissions for videos" sub section for more details.
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                "Permission required",
                "Permission to access the media library is required.",
            );
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos"],
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            ref.current?.setImage(result.assets[0].uri, 200, 200);
        }
    };

    return (
        <View
            style={[
                styles.cardContainer,
                {
                    backgroundColor: Colors[colorScheme].bg_light,
                    borderColor: Colors[colorScheme].border,
                },
            ]}
        >
            <KeyboardAvoidingView>
                <EditorToolbar
                    style={styles.toolbar}
                    actions={{
                        onBold: () => ref.current?.toggleBold(),
                        onItalic: () => ref.current?.toggleItalic(),
                        onUnderline: () => ref.current?.toggleUnderline(),
                        onImage: pickImage,
                        onLink: () => ref.current?.setLink, // if supported
                        onBulletList: () => ref.current?.toggleUnorderedList(), // if supported
                        onOrderedList: () => ref.current?.toggleOrderedList(), // if supported
                    }}
                    activeStyles={{
                        bold: stylesState?.bold.isActive,
                        italic: stylesState?.italic.isActive,
                        underline: stylesState?.underline.isActive,
                    }}
                />
            </KeyboardAvoidingView>
            <TextInput
                placeholder="Title"
                editable
                multiline
                numberOfLines={4}
                style={{
                    width: "100%",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 22,
                    fontWeight: 600,
                    backgroundColor: Colors[colorScheme].bg_dark,
                }}
            />
            <EnrichedTextInput
                ref={ref}
                placeholder="What's on your mind?"
                onChangeState={(e) => setStylesState(e.nativeEvent)}
                style={styles.input}
                onChangeSelection={(e) => setSelectedText(e.nativeEvent)}
                onBlur={ref.current?.blur}
                onPasteImages={(e) =>
                    ref.current?.setImage(e.nativeEvent.images[0].uri, 200, 200)
                }
            />
            <View style={styles.actionButtonsContainer}>
                <Pressable
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: Colors[colorScheme].bg_dark,
                        },
                    ]}
                >
                    <ThemedText
                        type="defaultSemiBold"
                        style={{
                            color: Colors[colorScheme].tint,
                        }}
                    >
                        Save
                    </ThemedText>
                </Pressable>
                <Pressable
                    style={[
                        styles.actionButton,
                        { backgroundColor: Colors[colorScheme].tint },
                    ]}
                    onPress={() =>
                        router.navigate("/(tabs)/create/post_target")
                    }
                >
                    <ThemedText
                        type="defaultSemiBold"
                        style={{
                            color: Colors[colorScheme].button_text,
                        }}
                    >
                        Next
                    </ThemedText>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        height: "100%",
        borderRadius: 8,
        borderWidth: 1,
        gap: 16,
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        minHeight: 600,
        elevation: 2,
    },
    input: {
        flex: 1,
        height: "100%",
        width: "100%",
        fontSize: 16,
        backgroundColor: "hsl(0 0% 90%)",
        borderRadius: 8,
        padding: 8,
    },
    toolbar: {
        backgroundColor: "hsl(0 0% 90%)",
        borderRadius: 8,
    },
    actionButtonsContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
});

export default DraftEditor;
