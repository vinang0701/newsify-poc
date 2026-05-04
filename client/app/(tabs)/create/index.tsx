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

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useCallback, useEffect } from "react";
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
import { useAuthStore } from "@/utils/authStore";
import api from "@/lib/axios";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import PostTarget from "@/components/post_target";
import { usePreferences } from "@/hooks/usePreferences";
import { useCommunity, UserCommunities } from "@/hooks/useCommunity";
import useCreatePost from "@/hooks/useCreatePost";
import useDrafts from "@/hooks/useDrafts";
import { DraftData, PostData, ServerReponse } from "@/data/types";
import { ModerationData, ModerationModal } from "./moderation_modal";

export default function CreatePost() {
    // get user data
    const { metadata } = useAuthStore();
    if (!metadata) {
        return null;
    }
    const inst_id = metadata.inst_id;
    const user_id = metadata.user_id;
    const colorScheme = useColorScheme() ?? "light";
    // using steps instead of tabs
    const [inputValue, setInputValue] = useState("");
    const [titleInputValue, setTitleInputValue] = useState("");
    const [descriptionValue, setDescriptionValue] = useState("");
    const [activeFilter, setActiveFilter] = useState("new");
    const router = useRouter();

    // draft id
    const [draftId, setDraftId] = useState<string | null>(null);
    // custom hooks
    const { categories } = usePreferences();
    const { mutate, isPending } = useCreatePost();
    const [moderationData, setModerationData] = useState<ModerationData | null>(
        null,
    );
    const [moderationModalVisible, setModerationModalVisible] = useState(false);
    const { queryClient, mu_saveDraft, isPendingSaveDraft } = useDrafts();
    const {
        data: myDrafts,
        error: myDraftsError,
        isFetching: isFetchingMyDrafts,
        refetch: refetchMyDrafts,
    } = useQuery<DraftData[]>({
        queryKey: ["drafts"],
        queryFn: async (): Promise<DraftData[]> => {
            const response = await api.get("/users/me/drafts");
            if (!response || !response.data) {
                throw new Error("Error occurred while fetching drafts");
            }
            return response.data;
        },
        // enabled: activeFilter === "drafts",
    });
    const { data: myCommunities, error: myCommunitiesError } = useQuery<
        UserCommunities[]
    >({
        queryKey: ["user_communities"],
        queryFn: async () => {
            const response = await api.get<UserCommunities[]>(
                `/users/me/communities`,
            );
            if (!response.data || !response) {
                throw new Error(
                    "Error while fetching community membership data.",
                );
            }
            return response.data;
        },
        enabled: activeFilter === "target",
    });

    // to store thumbnail and any images within content
    const [images, setImages] = useState<string[]>([]);
    const [thumbnail, setThumbnail] = useState("");

    // Rich text editor ref
    const ref = useRef<EnrichedTextInputInstance>(null);
    const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>();

    // content html
    const [contentHtml, setContentHtml] = useState("");
    const contentRef = useRef("");

    // States to pass to PostTarget
    // School checkbox
    const [isSchoolChecked, setIsSchoolChecked] = useState(false);
    // Stores the category_id the user picks for this post
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    // Selected community IDs
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // drag to refresh page
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        console.log("refetching");
        refetchMyDrafts();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

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
            mediaTypes: ["images"],
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
        const uri = await pickMedia();
        if (uri) {
            setThumbnail(uri);
        }
    };

    const handleNavigateToTarget = async () => {
        if (thumbnail === "" || thumbnail === undefined) {
            Alert.alert("Error", "Please add a thumbnail.");
            return;
        }
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
        setActiveFilter("target");
    };

    // Upload post
    const handlePublish = () => {
        if (!isSchoolChecked && selectedIds.length === 0) {
            Alert.alert("Error", "Please select at least one target audience.");
            return;
        }

        if (selectedCategoryId === "" || selectedCategoryId === null) {
            Alert.alert("Error", "Please select a category.");
            return;
        }

        const payload: PostData = {
            title: titleInputValue,
            description: descriptionValue,
            content: contentHtml,
            isSchoolChecked: isSchoolChecked,
            selectedCategoryId: selectedCategoryId,
            selectedIds: selectedIds,
            thumbnail: thumbnail,
        };
        // {
        //                 status: string;
        //                 score: string;
        //                 is_flagged: boolean;
        //                 flagged_categories: { category: string; score: string }[];
        //             }
        mutate(payload, {
            onSuccess: (data: ModerationData) => {
                // Success logic here (e.g., redirecting)
                setThumbnail("");
                setTitleInputValue("");
                setContentHtml("");
                setDescriptionValue("");
                setIsSchoolChecked(false);
                setSelectedCategoryId("");
                setSelectedCategoryName("");
                setSelectedIds([]);
                setContentHtml("");
                contentRef.current = "";
                setModerationData(data);
                setModerationModalVisible(true);
                // Alert.alert("Post created!", data.message);
            },
            onError: (err: any) => {
                // Specific UI feedback
                alert("Upload failed: " + err.message);
            },
        });
    };

    const handleSaveDraft = async () => {
        const content = await ref.current?.getHTML();

        const payload: DraftData = {
            draft_id: draftId ? draftId : undefined,
            thumbnail: thumbnail,
            title: titleInputValue,
            content: content,
        };
        mu_saveDraft(payload, {
            onSuccess: (data: ServerReponse) => {
                setThumbnail("");
                setTitleInputValue("");
                setContentHtml("");
                queryClient.invalidateQueries({ queryKey: ["drafts"] });
                Alert.alert(data.status, data.message);
            },
            onError: (err) => {
                Alert.alert("Error", err.message || "Failed to delete draft.");
            },
        });
    };

    useEffect(() => {
        if (activeFilter === "new" && contentRef.current) {
            const timeout = setTimeout(() => {
                ref.current?.setValue(contentRef.current);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [activeFilter]);

    if (isFetchingMyDrafts) {
        return (
            <ActivityIndicator
                size={"large"}
                color={Colors[colorScheme].tint}
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            />
        );
    }

    return (
        <KeyboardAvoidingView
            behavior="height"
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                style={{
                    backgroundColor: Colors[colorScheme].bg,
                }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
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
                        <ThemedText type="sub_heading">
                            Creating a Post
                        </ThemedText>
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
                                        activeFilter.toLowerCase() === "new" ||
                                        activeFilter.toLowerCase() === "target"
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
                                        activeFilter.toLowerCase() === "new" ||
                                        activeFilter.toLowerCase() === "target"
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
                    {activeFilter.toLowerCase() === "new" && (
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
                                    ref={ref}
                                    onChangeText={(e) => {
                                        setInputValue(e.nativeEvent.value);
                                        setDescriptionValue(
                                            e.nativeEvent.value,
                                        );
                                    }}
                                    placeholder="What's on your mind?"
                                    onChangeState={(e) =>
                                        setStylesState(e.nativeEvent)
                                    }
                                    style={styles.input}
                                    htmlStyle={{
                                        h2: { bold: true, fontSize: 20 },
                                        h3: { bold: true, fontSize: 18 },
                                    }}
                                    onBlur={ref.current?.blur}
                                    onPasteImages={(e) =>
                                        ref.current?.setImage(
                                            e.nativeEvent.images[0].uri,
                                            200,
                                            200,
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.paragraphStyles}>
                                <Pressable
                                    style={[
                                        styles.paraButton,
                                        {
                                            backgroundColor: stylesState?.h2
                                                ?.isActive
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
                                                ? Colors[colorScheme]
                                                      .button_text
                                                : Colors[colorScheme].text,
                                        }}
                                    >
                                        H3
                                    </ThemedText>
                                </Pressable>
                            </View>
                            <View style={styles.actionButtonsContainer}>
                                <Pressable
                                    disabled={isPendingSaveDraft}
                                    style={[
                                        styles.actionButton,
                                        {
                                            backgroundColor:
                                                Colors[colorScheme].text,
                                        },
                                    ]}
                                    // onPress={() => mutate()}
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
                    {activeFilter === "drafts" && (
                        <DraftsTab draftData={myDrafts || []} />
                    )}

                    {activeFilter === "target" && (
                        <PostTarget
                            isSchoolChecked={isSchoolChecked}
                            setIsSchoolChecked={setIsSchoolChecked}
                            selectedCategoryId={selectedCategoryId}
                            setSelectedCategoryId={setSelectedCategoryId}
                            selectedCategoryName={selectedCategoryName}
                            setSelectedCategoryName={setSelectedCategoryName}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            categories={categories}
                            communities={myCommunities}
                            // communities={[]}
                            onBack={() => {
                                setActiveFilter("new");
                                ref.current?.setValue(contentHtml);
                            }}
                            onSubmit={handlePublish}
                            isPendingSubmit={isPending}
                        />
                    )}
                </View>
            </ScrollView>
            <ModerationModal
                visible={moderationModalVisible}
                setVisible={setModerationModalVisible}
                data={moderationData}
            />
        </KeyboardAvoidingView>
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
    cardContainer: {
        borderRadius: 8,
        gap: 16,
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    input: {
        minHeight: 200,
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
