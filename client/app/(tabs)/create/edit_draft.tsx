import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    ScrollView,
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
import {
    Community,
    DraftData,
    PostData,
    PostDestination,
    ServerReponse,
} from "@/data/types";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
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
import useDrafts from "@/hooks/useDrafts";
import { usePreferences } from "@/hooks/usePreferences";
import useCreatePost from "@/hooks/useCreatePost";
import { ModerationData, ModerationModal } from "@/components/moderation_modal";
import PostTarget from "@/components/post_target";
import Checkbox from "expo-checkbox";

const EditDraftTab = () => {
    const { draft_id } = useLocalSearchParams<{ draft_id: string }>();
    const colorScheme = useColorScheme() ?? "light";
    const router = useRouter();

    // Rich text editor ref
    const ref = useRef<EnrichedTextInputInstance>(null);
    const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>();
    // fetch draft
    const [titleInputValue, setTitleInputValue] = useState("");
    const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
    const [descriptionValue, setDescriptionValue] = useState("");

    const [step, setStep] = useState("draft");

    // States to pass to PostTarget
    // School checkbox
    const [destination, setDestination] = useState<PostDestination>("PUBLIC");
    // Stores the category_id the user picks for this post
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    // Selected community IDs
    const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
    const [commPublicModalVisible, setCommPublicModalVisible] = useState(false);
    const [isPublicOverride, setIsPublicOverride] = useState(false);

    // content html to handle navigate back and forth
    const [contentHtml, setContentHtml] = useState("");
    const contentRef = useRef("");

    // custom hook
    const { queryClient, mu_saveDraft, isPendingSaveDraft } = useDrafts();
    const { categories } = usePreferences();
    const { mutate, isPending } = useCreatePost();
    const [moderationData, setModerationData] = useState<ModerationData | null>(
        null,
    );
    const [moderationModalVisible, setModerationModalVisible] = useState(false);

    const {
        data,
        error,
        isLoading: isLoadingDraft,
    } = useQuery<DraftData>({
        queryKey: ["draft", draft_id],
        queryFn: async (): Promise<DraftData> => {
            const response = await api.get(`/users/me/drafts/${draft_id}`);
            return response.data;
        },
    });

    const {
        data: myCommunities,
        error: myCommunitiesError,
        isLoading: isLoadingComm,
    } = useQuery<Community[]>({
        queryKey: ["user_communities"],
        queryFn: async () => {
            const response = await api.get<Community[]>(
                `/users/me/communities`,
            );
            if (!response.data || !response) {
                throw new Error(
                    "Error while fetching community membership data.",
                );
            }
            return response.data;
        },
        enabled: step === "target",
    });

    // Populate editor once data is available
    useEffect(() => {
        if (contentHtml) {
            ref.current?.setValue(contentHtml);
            return;
        }

        // 2. Otherwise fall back to the initial database draft payload
        if (data) {
            setTitleInputValue(data.title ?? "");
            setThumbnail(data.thumbnail ?? "");
            ref.current?.setValue(data.content ?? "");
        }
    }, [data, step, contentHtml]);

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
        }
    };
    const pickThumbnail = async () => {
        const uri = await pickMedia(); // Maybe a wider aspect for headers?
        if (uri) {
            setThumbnail(uri);
        }
    };

    const handleNavigateToTarget = async () => {
        if (!titleInputValue.trim()) {
            Alert.alert("Error", "Please include a title.");
            return;
        }

        const content = await ref.current?.getHTML();

        if (!content || !content.trim()) {
            Alert.alert("Error", "Please include a body.");
            return;
        }
        contentRef.current = content;
        setContentHtml(content);
        // console.log(descriptionValue);
        setStep("target");
    };

    // hande save draft
    const handleSaveDraft = async () => {
        const content = await ref.current?.getHTML();
        console.log(content);

        const payload: DraftData = {
            draft_id: data?.draft_id,
            thumbnail: thumbnail,
            title: titleInputValue,
            content: content,
        };
        mu_saveDraft(payload, {
            onSuccess: (data: ServerReponse) => {
                setThumbnail("");
                setTitleInputValue("");

                queryClient.invalidateQueries({ queryKey: ["drafts"] });
                Alert.alert(data.status, data.message);
            },
            onError: (err) => {
                Alert.alert("Error", err.message || "Failed to delete draft.");
            },
        });
    };

    const handlePublish = () => {
        if (selectedCategoryId === "" || selectedCategoryId === null) {
            Alert.alert("Error", "Please select a category.");
            return;
        }

        const finalIsPublic =
            destination === "PUBLIC" ||
            (destination === "COMMUNITY" && isPublicOverride);
        const finalCommunityId =
            destination === "COMMUNITY" ? selectedCommunityId : undefined;

        const payload: PostData = {
            draft_id: draft_id,
            title: titleInputValue,
            description: descriptionValue,
            content: contentHtml,
            destination: destination,
            is_public: finalIsPublic,
            selectedCategoryId: selectedCategoryId,
            selectedCommunityId: finalCommunityId,
            thumbnail: thumbnail,
        };

        console.log(payload);
        mutate(payload, {
            onSuccess: (data: ModerationData) => {
                // Success logic here (e.g., redirecting)
                setThumbnail(undefined);
                setTitleInputValue("");
                setContentHtml("");
                setDescriptionValue("");
                setDestination("PUBLIC");
                setSelectedCategoryId("");
                setSelectedCategoryName("");
                setSelectedCommunityId("");
                contentRef.current = "";
                setModerationData(data);
                setModerationModalVisible(true);
                setCommPublicModalVisible(false);
                setIsPublicOverride(false);
                setStep("draft");
                queryClient.invalidateQueries({ queryKey: ["drafts"] });
            },
            onError: (err: any) => {
                // Specific UI feedback
                alert("Upload failed: " + err.message);
            },
        });
    };

    if (!data) {
        return <Loading />;
    }

    return (
        <KeyboardAvoidingView
            behavior="height"
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
        >
            {isPending && <Loading />}
            {/* Editor Card */}
            <ScrollView
            // contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            >
                <SafeAreaView>
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
                </SafeAreaView>
                <View
                    style={{
                        flex: 1,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        gap: 12,
                    }}
                >
                    {step === "draft" && (
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
                                            backgroundColor:
                                                "hsla(0, 0%, 0%, 0.7)",
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
                                            color={
                                                Colors[colorScheme].button_text
                                            }
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
                                        backgroundColor:
                                            Colors[colorScheme].bg_light,
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
                                            color: Colors[colorScheme]
                                                .text_light,
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
                                placeholderTextColor={
                                    Colors[colorScheme].caption
                                }
                                style={{
                                    width: "100%",
                                    borderRadius: 8,
                                    padding: 12,
                                    fontSize: 22,
                                    fontWeight: 600,
                                    textAlignVertical: "top",
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                }}
                            />
                            <View style={{ flex: 1, width: "100%" }}>
                                <EditorToolbar
                                    style={[
                                        styles.toolbar,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].bg_light,
                                            borderColor:
                                                Colors[colorScheme].border,
                                        },
                                    ]}
                                    actions={{
                                        onBold: () =>
                                            ref?.current?.toggleBold(),
                                        onItalic: () =>
                                            ref.current?.toggleItalic(),
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
                                        underline:
                                            stylesState?.underline.isActive,
                                    }}
                                />
                                <EnrichedTextInput
                                    scrollEnabled
                                    ref={ref}
                                    placeholder="What's on your mind?"
                                    onChangeState={(e) =>
                                        setStylesState(e.nativeEvent)
                                    }
                                    onChangeText={(e) => {
                                        setDescriptionValue(
                                            e.nativeEvent.value,
                                        );
                                    }}
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
                                <View style={styles.paragraphStyles}>
                                    <Pressable
                                        style={[
                                            styles.paraButton,
                                            {
                                                backgroundColor: stylesState?.h2
                                                    ?.isActive
                                                    ? Colors[colorScheme].tint
                                                    : Colors[colorScheme]
                                                          .bg_light,
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
                                                    ? Colors[colorScheme]
                                                          .button_text
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
                                                backgroundColor: stylesState?.h3
                                                    ?.isActive
                                                    ? Colors[colorScheme].tint
                                                    : Colors[colorScheme]
                                                          .bg_light,
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
                                                    ? Colors[colorScheme]
                                                          .button_text
                                                    : Colors[colorScheme].text,
                                            }}
                                        >
                                            H3
                                        </ThemedText>
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.actionButtonsContainer}>
                                <Pressable
                                    // disabled={isPendingSaveDraft}
                                    style={[
                                        styles.actionButton,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].text,
                                        },
                                    ]}
                                    onPress={handleSaveDraft}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        }}
                                    >
                                        {isPendingSaveDraft
                                            ? "Saving..."
                                            : "Save"}
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
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        }}
                                    >
                                        Next
                                    </ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    )}
                    {step === "target" && (
                        <PostTarget
                            destination={destination}
                            setDestination={setDestination}
                            selectedCategoryId={selectedCategoryId}
                            setSelectedCategoryId={setSelectedCategoryId}
                            selectedCategoryName={selectedCategoryName}
                            setSelectedCategoryName={setSelectedCategoryName}
                            selectedCommunityId={selectedCommunityId}
                            setSelectedCommunityId={setSelectedCommunityId}
                            categories={categories ?? []}
                            communities={myCommunities}
                            onBack={() => {
                                setStep("draft");
                                // ref.current?.setValue(contentHtml);
                            }}
                            onSubmit={handlePublish}
                            isPendingSubmit={isPending}
                            onNext={() => setCommPublicModalVisible(true)}
                        />
                    )}
                </View>
                <Modal
                    visible={commPublicModalVisible}
                    animationType="slide"
                    backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                    onRequestClose={() => setCommPublicModalVisible(false)}
                >
                    <View style={styles.centeredView}>
                        <View
                            style={[
                                styles.modalView,
                                {
                                    backgroundColor:
                                        Colors[colorScheme].bg_light,
                                },
                            ]}
                        >
                            <View
                                style={{
                                    gap: 4,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={{ color: Colors[colorScheme].text }}
                                >
                                    Community Admin Privilege
                                </ThemedText>
                                <ThemedText
                                    type="body_medium"
                                    style={{ color: Colors[colorScheme].text }}
                                >
                                    Do you want this post to be public or
                                    private?
                                </ThemedText>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <Checkbox
                                    value={!isPublicOverride}
                                    onValueChange={() => {
                                        setIsPublicOverride(false);
                                    }}
                                    style={styles.checkbox}
                                    color={Colors[colorScheme].text}
                                />
                                <ThemedText emphasized>
                                    Private (Community Only)
                                </ThemedText>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <Checkbox
                                    value={isPublicOverride}
                                    onValueChange={() => {
                                        setIsPublicOverride(true);
                                    }}
                                    style={styles.checkbox}
                                    color={Colors[colorScheme].text}
                                />
                                <ThemedText emphasized>
                                    Public (School + Community)
                                </ThemedText>
                            </View>

                            <View style={styles.buttonContainer}>
                                <Pressable
                                    style={[
                                        styles.commButton,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].text,
                                        },
                                    ]}
                                    onPress={() => {
                                        setCommPublicModalVisible(false);
                                        setIsPublicOverride(false);
                                    }}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        }}
                                    >
                                        Close
                                    </ThemedText>
                                </Pressable>
                                <Pressable
                                    style={[
                                        styles.commButton,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].tint,
                                        },
                                    ]}
                                    onPress={() => {
                                        handlePublish();
                                    }}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{
                                            color: Colors[colorScheme]
                                                .button_text,
                                            textAlign: "center",
                                        }}
                                    >
                                        Publish
                                    </ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            <ModerationModal
                visible={moderationModalVisible}
                setVisible={setModerationModalVisible}
                data={moderationData}
            />
        </KeyboardAvoidingView>
    );
};

export default EditDraftTab;

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
        height: 320,
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
        marginTop: 8,
    },
    paraButton: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
        borderWidth: 1,
    },
    centeredView: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        width: "100%",
        gap: 12,
        borderRadius: 8,
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
    buttonContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    commButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    checkbox: {
        width: 16,
        height: 16,
    },
});
