import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { DraftData, ServerReponse } from "@/data/types";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import {
    EnrichedTextInput,
    EnrichedTextInputInstance,
    OnChangeStateEvent,
} from "react-native-enriched";
import { Image } from "expo-image";
import EditorToolbar from "@/components/editor_toolbar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import Loading from "@/components/loading";
import usePosts from "@/hooks/usePosts";

const EditNewsPostTab = () => {
    const { news_id } = useLocalSearchParams<{ news_id: string }>();
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();
    // Rich text editor ref
    const ref = useRef<EnrichedTextInputInstance>(null);
    const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>();
    // fetch draft
    const [titleInputValue, setTitleInputValue] = useState("");
    const [thumbnail, setThumbnail] = useState<string>("");
    const [images, setImages] = useState<string[]>([]);

    // custom hook
    const { postData, isLoading } = usePosts(news_id);

    // Populate editor once data is available
    useEffect(() => {
        if (!postData) return;
        setTitleInputValue(postData.title ?? "");
        setThumbnail(postData.image_url);
        ref.current?.setValue(postData.content ?? "");
    }, [postData, isLoading]);

    // image picker functions
    const pickMedia = async () => {
        const { granted } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!granted) {
            Alert.alert(
                "Permission required",
                "Permission to access the media library is required.",
            );
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"], // Use the enum for clarity
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        return result.canceled ? null : result.assets[0].uri;
    };
    const pickImage = async () => {
        const uri = await pickMedia();
        if (uri) {
            ref.current?.setImage(uri, 360, 200);
            setImages((prev) => [...prev, uri]);
        }
    };
    const pickThumbnail = async () => {
        const uri = await pickMedia(); // Maybe a wider aspect for headers?
        if (uri) {
            setThumbnail(uri);
        }
    };

    if (!postData) {
        return <Loading />;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View
                style={[
                    styles.headerContainer,
                    { backgroundColor: Colors[colorScheme].tint },
                ]}
            >
                <Pressable onPress={() => router.back()}>
                    <Feather
                        name="arrow-left"
                        size={24}
                        color={Colors[colorScheme].button_text}
                    />
                </Pressable>
            </View>
            {/* Editor Card */}
            <View
                style={[
                    styles.cardContainer,
                    {
                        backgroundColor: Colors[colorScheme].bg,
                        // borderColor: Colors[colorScheme].border,
                    },
                ]}
            >
                {thumbnail ? (
                    <View style={{ width: "100%" }}>
                        <Pressable
                            style={{
                                alignSelf: "flex-start",
                                borderRadius: 50,
                                backgroundColor: "hsla(0, 0%, 0%, 0.7)",
                                position: "absolute",
                                zIndex: 10,
                                top: 8,
                                left: 8,
                                alignItems: "center",
                                justifyContent: "center",
                                width: 30,
                                height: 30,
                            }}
                            onPress={() => setThumbnail("")}
                        >
                            <Feather
                                name="x"
                                size={24}
                                color={Colors[colorScheme].button_text}
                            />
                        </Pressable>
                        <Image
                            source={thumbnail}
                            style={{
                                height: 200,
                                width: "100%",
                                borderRadius: 8,
                            }}
                        />
                    </View>
                ) : (
                    <Pressable
                        style={{
                            width: "100%",
                            height: 140,
                            backgroundColor: Colors[colorScheme].bg_light,
                            borderStyle: "dashed",
                            borderWidth: 1,
                            borderColor: Colors[colorScheme].border,
                            borderRadius: 8,
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: "center",
                        }}
                        onPress={pickThumbnail}
                    >
                        <MaterialCommunityIcons
                            name="upload-outline"
                            size={24}
                        />
                        <ThemedText
                            type="body_medium"
                            style={{
                                color: Colors[colorScheme].text_light,
                            }}
                        >
                            Upload thumbnail
                        </ThemedText>
                    </Pressable>
                )}
                <TextInput
                    placeholder="Write an interesting headline..."
                    editable
                    multiline
                    value={titleInputValue}
                    onChangeText={setTitleInputValue}
                    numberOfLines={4}
                    placeholderTextColor={Colors[colorScheme].caption}
                    style={{
                        width: "100%",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 22,
                        fontWeight: 600,
                        textAlignVertical: "top",
                        backgroundColor: Colors[colorScheme].bg_light,
                    }}
                />
                <View style={{ flex: 1, width: "100%" }}>
                    <EditorToolbar
                        style={[
                            styles.toolbar,
                            {
                                backgroundColor: Colors[colorScheme].bg_light,
                                borderColor: Colors[colorScheme].border,
                            },
                        ]}
                        actions={{
                            onBold: () => ref?.current?.toggleBold(),
                            onItalic: () => ref.current?.toggleItalic(),
                            onUnderline: () => ref.current?.toggleUnderline(),
                            onImage: pickImage,
                            onLink: () => ref.current?.setLink, // if supported
                            onBulletList: () =>
                                ref.current?.toggleUnorderedList(), // if supported
                            onOrderedList: () =>
                                ref.current?.toggleOrderedList(), // if supported
                        }}
                        activeStyles={{
                            bold: stylesState?.bold.isActive,
                            italic: stylesState?.italic.isActive,
                            underline: stylesState?.underline.isActive,
                        }}
                    />
                    <EnrichedTextInput
                        ref={ref}
                        placeholder="What's on your mind?"
                        onChangeState={(e) => setStylesState(e.nativeEvent)}
                        style={styles.input}
                        htmlStyle={{
                            h2: { bold: true, fontSize: 20 },
                            h3: { bold: true, fontSize: 18 },
                        }}
                        onBlur={ref.current?.blur}
                        onPasteImages={(e) => {
                            const img = e.nativeEvent.images[0];
                            ref.current?.setImage(
                                img.uri,
                                img.width,
                                img.height,
                            );
                        }}
                    />
                </View>
                <View style={styles.paragraphStyles}>
                    <Pressable
                        style={[
                            styles.paraButton,
                            {
                                backgroundColor: stylesState?.h2?.isActive
                                    ? Colors[colorScheme].tint
                                    : Colors[colorScheme].bg_light,
                            },
                        ]}
                        onPress={() => {
                            ref.current?.toggleH2();
                        }}
                    >
                        <ThemedText
                            type="body_small"
                            emphasized
                            style={{
                                color: stylesState?.h2?.isActive
                                    ? Colors[colorScheme].button_text
                                    : Colors[colorScheme].text,
                            }}
                        >
                            H2
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.paraButton,
                            {
                                backgroundColor: stylesState?.h3?.isActive
                                    ? Colors[colorScheme].tint
                                    : Colors[colorScheme].bg_light,
                            },
                        ]}
                        onPress={() => {
                            ref.current?.toggleH3();
                        }}
                    >
                        <ThemedText
                            type="body_small"
                            emphasized
                            style={{
                                color: stylesState?.h3?.isActive
                                    ? Colors[colorScheme].button_text
                                    : Colors[colorScheme].text,
                            }}
                        >
                            H3
                        </ThemedText>
                    </Pressable>
                </View>
                <View style={styles.actionButtonsContainer}>
                    <Pressable
                        // disabled={isPendingSaveDraft}
                        style={[
                            styles.actionButton,
                            {
                                backgroundColor: Colors[colorScheme].text,
                            },
                        ]}
                        onPress={() => {}}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={{
                                color: Colors[colorScheme].button_text,
                                textAlign: "center",
                            }}
                        >
                            {/* {isPendingSaveDraft ? "Saving..." : "Save"} */}
                            Cancel
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.actionButton,
                            {
                                backgroundColor: Colors[colorScheme].tint,
                            },
                        ]}
                        // onPress={() => handleNavigateToTarget()}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={{
                                color: Colors[colorScheme].button_text,
                                textAlign: "center",
                            }}
                        >
                            Next
                        </ThemedText>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default EditNewsPostTab;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
    },
    cardContainer: {
        flex: 1,
        borderRadius: 8,
        gap: 16,
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    input: {
        minHeight: 300,
        width: "100%",
        fontSize: 16,
        borderRadius: 8,
        padding: 8,
        backgroundColor: "hsl(0 0% 100%)",
    },
    toolbar: {
        backgroundColor: "hsl(0 0% 100%)",
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
        borderBottomWidth: 1,
    },
    actionButtonsContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    paragraphStyles: {
        width: "100%",
        flexDirection: "row",
        gap: 4,
    },
    paraButton: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
        borderWidth: 1,
    },
});
