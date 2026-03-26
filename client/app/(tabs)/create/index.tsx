import { Image } from "expo-image";
import {
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Platform,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView,
    RefreshControl,
} from "react-native";
import axios from "axios";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useCallback } from "react";
import { useNavigation, useRouter } from "expo-router";
import DraftsTab from "@/components/drafts";
import {
    EnrichedTextInput,
    EnrichedTextInputInstance,
    OnChangeStateEvent,
} from "react-native-enriched";
import * as ImagePicker from "expo-image-picker";
import EditorToolbar from "@/components/editor_toolbar";
import Feather from "@expo/vector-icons/Feather";
type ModerationResponse = {
    content: string;
    flag: boolean;
};

type SelectedText = {
    start: number;
    end: number;
    text: string;
};

type Draft = {
    image?: string;
    title?: string;
    content?: string;
};

const BASE_URL = "http://10.0.2.2:8000/api/v1";
const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";
const user_id = "4813d507-9b97-4bb7-bee4-39ec47070889";
export default function CreatePost() {
    const colorScheme = useColorScheme() ?? "light";
    const [inputValue, setInputValue] = useState("");
    const [titleInputValue, setTitleInputValue] = useState("");
    const [activeFilter, setActiveFilter] = useState("New");
    const navigation = useNavigation();
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);
    const [selectedText, setSelectedText] = useState<SelectedText>();
    const ref = useRef<EnrichedTextInputInstance>(null);
    function handleSelectedText(start: number, end: number, text: string) {
        setSelectedText({ start, end, text });
    }

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        console.log("refetching");
        refetch();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

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
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const saveDraft = async () => {
        const formData = new FormData();
        formData.append("user_id", user_id);
        if (titleInputValue === "" && inputValue === "") {
            throw Error("Ew can't save draft");
        }
        formData.append("title", titleInputValue);
        formData.append("content", inputValue);
        setInputValue("");
        setTitleInputValue("");
        setImage("");

        if (image) {
            const filename = image.split("/").pop() || "upload.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append("image", {
                uri: image,
                name: filename,
                type: type,
            } as any);
        }

        console.log(formData);

        const response = await axios.post(
            `${BASE_URL}/${inst_id}/users/me/drafts`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    // "Authorization": `Bearer ${token}` // If your FastAPI uses Supabase Auth
                },
            },
        );

        return response.data;
    };

    async function fetchUserDrafts(): Promise<Draft[]> {
        console.log("fetching in profile");
        try {
            const response = await axios.get<Draft[]>(
                `${BASE_URL}/${inst_id}/users/me/drafts`,
                { params: { user_id: user_id } },
            );

            return response.data;
        } catch (error) {
            // Re-throwing the error allows TanStack Query to "see" the failure
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    const {
        status,
        data: draftData,
        error: draftError,
        isFetching,
        refetch,
    } = useQuery<Draft[]>({
        queryKey: ["user_drafts", user_id],
        queryFn: fetchUserDrafts,
    });

    const { mutate, isPending, data, error } = useMutation({
        mutationKey: ["moderation"],
        mutationFn: saveDraft,

        onSuccess: () => {
            setInputValue("");
            Alert.alert("Successfully saved draft.");
            console.log(data);
        },

        onError: (err) => {
            console.log("Post failed:", err);
            Alert.alert("Failed to publish post");
        },
    });

    const handleNavigateToTarget = () => {
        if (image === "" || image === null) {
            Alert.alert("Please add an image.");
            return;
        }
        if (!titleInputValue.trim()) {
            Alert.alert("Please include a title.");
            return;
        }
        if (!inputValue.trim()) {
            Alert.alert("Please include a title.");
            return;
        }

        router.push({
            pathname: "/(tabs)/create/post_target",
            params: {
                imageUri: image,
                title: titleInputValue,
                content: inputValue,
            },
        });
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={false}
            style={{
                backgroundColor: Colors[colorScheme].bg,
            }}
            contentContainerStyle={{ flex: 1, paddingBottom: 16 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <SafeAreaView edges={["top"]}>
                <Header />
            </SafeAreaView>

            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    gap: 12,
                }}
            >
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="sub_heading">Creating a Post</ThemedText>
                </ThemedView>
                {/* Tab navigation */}
                <ThemedView
                    style={{
                        flexDirection: "row",
                        gap: 8,
                    }}
                >
                    <Pressable
                        onPress={() => {
                            setActiveFilter("new");
                        }}
                        style={[
                            {
                                backgroundColor:
                                    activeFilter.toLowerCase() === "new"
                                        ? Colors[colorScheme].tint
                                        : Colors[colorScheme].bg_light,
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderColor: Colors[colorScheme].border,
                                borderWidth: 1,

                                borderRadius: 4,
                            },
                        ]}
                    >
                        <ThemedText
                            type="caption"
                            emphasized
                            style={{
                                color:
                                    activeFilter.toLowerCase() === "new"
                                        ? Colors[colorScheme].button_text
                                        : Colors[colorScheme].tint,
                            }}
                        >
                            New
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            setActiveFilter("drafts");
                        }}
                        style={[
                            {
                                backgroundColor:
                                    activeFilter.toLowerCase() === "drafts"
                                        ? Colors[colorScheme].tint
                                        : Colors[colorScheme].bg_light,
                                paddingHorizontal: 12,
                                paddingVertical: 4,
                                borderColor: Colors[colorScheme].border,
                                borderWidth: 1,
                                borderRadius: 4,
                            },
                        ]}
                    >
                        <ThemedText
                            type="caption"
                            emphasized
                            style={{
                                color:
                                    activeFilter.toLowerCase() === "drafts"
                                        ? Colors[colorScheme].button_text
                                        : Colors[colorScheme].tint,
                            }}
                        >
                            Drafts
                        </ThemedText>
                    </Pressable>
                </ThemedView>
                {activeFilter.toLowerCase() === "new" ? (
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
                                    onBold: () => ref?.current?.toggleBold(),
                                    onItalic: () => ref.current?.toggleItalic(),
                                    onUnderline: () =>
                                        ref.current?.toggleUnderline(),
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
                        </KeyboardAvoidingView>
                        {image && (
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
                                    onPress={() => setImage("")}
                                >
                                    <Feather
                                        name="x"
                                        size={24}
                                        color={Colors[colorScheme].button_text}
                                    />
                                </Pressable>
                                <Image
                                    source={image}
                                    style={{
                                        height: 200,
                                        width: "100%",
                                        borderRadius: 8,
                                    }}
                                />
                            </View>
                        )}
                        <TextInput
                            placeholder="Title"
                            editable
                            multiline
                            value={titleInputValue}
                            onChangeText={setTitleInputValue}
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
                            onChangeText={(e) =>
                                setInputValue(e.nativeEvent.value)
                            }
                            placeholder="What's on your mind?"
                            onChangeState={(e) => setStylesState(e.nativeEvent)}
                            style={styles.input}
                            onChangeSelection={(e) =>
                                setSelectedText(e.nativeEvent)
                            }
                            onBlur={ref.current?.blur}
                            onPasteImages={(e) =>
                                ref.current?.setImage(
                                    e.nativeEvent.images[0].uri,
                                    200,
                                    200,
                                )
                            }
                        />
                        <View style={styles.actionButtonsContainer}>
                            <Pressable
                                style={[
                                    styles.actionButton,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].bg_dark,
                                    },
                                ]}
                                onPress={() => mutate()}
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
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].tint,
                                    },
                                ]}
                                onPress={() => handleNavigateToTarget()}
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
                ) : (
                    <DraftsTab draftData={draftData || []} />
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    modalView: {
        borderWidth: 1,
        width: "100%",
        margin: 16,
        borderRadius: 8,
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
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
