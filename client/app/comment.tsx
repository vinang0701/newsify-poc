import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import React, {
    useCallback,
    useMemo,
    useRef,
    useEffect,
    useState,
} from "react";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
    useLocalSearchParams,
    useNavigation,
    useRouter,
    useFocusEffect,
} from "expo-router";
import { ThemedText } from "@/components/themed-text";
import {
    BottomSheetTextInput,
    BottomSheetView,
    useBottomSheetScrollableCreator,
} from "@gorhom/bottom-sheet";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { useAuthStore } from "@/utils/authStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { PostComment } from "@/data/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import DropdownMenu, { MenuOption } from "@/components/dropdown_menu";
import Feather from "@expo/vector-icons/Feather";

export const CreateCommentSchema = z.object({
    comment_text: z
        .string()
        .min(1, "Comment cannot be empty")
        .max(500, "Comment must be under 500 characters")
        .trim(),
    parent_comment_id: z.uuid().optional(),
});

type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

const Comment = () => {
    const snapPoints = useMemo(() => ["100%"], []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);
    const [replyingToName, setReplyingToName] = useState<string | undefined>(
        undefined,
    );

    // Report modal
    const [modalVisible, setModalVisible] = useState(false);
    const [reportCommentId, setReportCommentId] = useState<string | null>(null);

    // from comments modal
    const colorScheme = useColorScheme() ?? "light";
    // const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const { user, metadata, session } = useAuthStore();
    const [commentText, setCommentText] = useState("");
    const [commentParentId, setCommentParentId] = useState<string | undefined>(
        undefined,
    );
    const [expandedComments, setExpandedComments] = useState<Set<string>>(
        new Set(),
    );
    const BottomSheetFlashListScrollable = useBottomSheetScrollableCreator();

    if (!metadata) {
        console.error("Unable to retrieve metadata from JWt.");
    }
    const inst_id = metadata?.inst_id;
    const params = useLocalSearchParams<{
        post_id: string;
    }>();

    const post_id = params.post_id;

    const fetchPostComments = async (): Promise<PostComment[]> => {
        const response = await api.get(`${inst_id}/news/${post_id}/comments`);

        return response.data;
    };

    const {
        isFetching: isFetchingComments,
        data: comment_data,
        error: comment_error,
    } = useQuery<PostComment[]>({
        queryKey: ["comments", post_id],
        queryFn: fetchPostComments,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });

    // useMutation create comment
    const createComment = async (data: CreateCommentInput) => {
        console.log("there we go");
        const validated = CreateCommentSchema.safeParse(data);

        if (!validated.success) {
            console.error(
                "Zod Validation Error:",
                z.treeifyError(validated.error),
            );
            throw new Error("Invalid comment format");
        }

        const response = await api.post(
            `${inst_id}/news/${post_id}/comments`,
            validated.data,
        );

        return response.data;
    };

    const { mutate: mu_createComment, isPending: isPendingCommentCreate } =
        useMutation({
            mutationFn: createComment,
            onSettled: () => {
                setCommentText("");
            },
            onSuccess: () => {
                setCommentText("");
                queryClient.invalidateQueries({
                    queryKey: ["comments", post_id],
                });
                queryClient.invalidateQueries({
                    queryKey: ["news"],
                });
            },
            onError: (error) => {
                console.log(error);
            },
        });

    const handleCommentSubmit = () => {
        if (!commentText.trim()) return;

        mu_createComment({
            comment_text: commentText,
            parent_comment_id: commentParentId,
        });
    };

    // Reply functions
    const handleReply = (
        commentId: string,
        name: string,
        parentCommentId?: string,
    ) => {
        const actualParentId = parentCommentId || commentId;

        setCommentParentId(actualParentId);
        setReplyingToName(name);
        inputRef.current?.focus();
    };

    const cancelReply = () => {
        setCommentParentId(undefined);
        setReplyingToName(undefined);
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        ),
        [],
    );

    // calculate elapsed days since commented
    dayjs.extend(relativeTime);

    const getRelativeTime = (date: string) => {
        const now = dayjs();
        const then = dayjs(date);
        const diffInSeconds = now.diff(then, "second");
        const diffInMinutes = now.diff(then, "minute");
        const diffInHours = now.diff(then, "hour");
        const diffInDays = now.diff(then, "day");
        const diffInWeeks = now.diff(then, "week");

        if (diffInSeconds < 60) return "now";
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInHours < 24) return `${diffInHours}h`;
        if (diffInDays < 7) return `${diffInDays}d`;
        if (diffInWeeks < 52) return `${diffInWeeks}w`;
        return then.format("MM/DD/YY");
    };

    // Testing flattening data
    const flattenComments = (comments: any[]) => {
        const commentMap = new Map(
            comments.map((c) => [
                c.comment_id,
                {
                    ...c,
                    displayTime: getRelativeTime(c.created_at),
                },
            ]),
        );

        const flattened: any[] = [];

        // 1. Get all Top-Level comments (Depth 0)
        const roots = comments
            .filter((c) => !c.parent_comment_id)
            .sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
            );

        roots.forEach((root) => {
            const enrichedRoot = commentMap.get(root.comment_id);
            flattened.push({ ...enrichedRoot, depth: 0 });

            // 2. Find all descendants (Replies to this parent, or replies to those replies)
            // We find anything that eventually traces back to this root.
            // For a simple "max 1 depth", we find all comments where parent_comment_id == root.comment_id
            const replies = comments
                .filter((c) => c.parent_comment_id === root.comment_id)
                .sort(
                    (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime(),
                );

            const isExpanded = expandedComments.has(root.comment_id);

            if (replies.length > 0) {
                if (isExpanded) {
                    replies.forEach((reply) => {
                        const parent = commentMap.get(reply.parent_comment_id);
                        flattened.push({
                            ...commentMap.get(reply.comment_id),
                            depth: 1,
                            reply_to_user_name: parent?.commented_by_user_name,
                        });
                    });
                    flattened.push({
                        comment_id: `hide-${root.comment_id}`,
                        type: "hide_trigger",
                        parent_comment_id: root.comment_id,
                        depth: 1,
                    });
                } else {
                    flattened.push({
                        comment_id: `expand-${root.comment_id}`, // unique ID
                        type: "expand_trigger",
                        parent_comment_id: root.comment_id,
                        count: replies.length,
                        depth: 1,
                    });
                }
            }
        });

        return flattened;
    };

    const processedComments: any[] = useMemo(
        () => (comment_data ? flattenComments(comment_data) : []),
        [comment_data, expandedComments],
    );

    const toggleExpandComment = (id: string) => {
        setExpandedComments((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleReportPress = (comment_id: string) => {};

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                enableDynamicSizing={false}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
                topInset={insets.top}
                // onChange={handleSheetChange}
                onClose={() => router.back()}
                animationConfigs={{
                    duration: 180,
                }}
            >
                {/* <CommentsModal /> */}
                <BottomSheetView
                    style={[
                        styles.bottomSheet,
                        {
                            backgroundColor: Colors[colorScheme].bg_light,
                        },
                    ]}
                >
                    <ThemedText
                        type="defaultSemiBold"
                        style={{ textAlign: "center" }}
                    >
                        Comments
                    </ThemedText>
                    <View style={{ width: "100%", paddingHorizontal: 16 }}>
                        <Pressable
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <ThemedText type="caption">Sort</ThemedText>
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={16}
                            />
                        </Pressable>
                    </View>
                    {/* Comments Container*/}

                    <FlashList
                        contentContainerStyle={styles.commentsContainer}
                        data={processedComments}
                        keyExtractor={(item) => item.comment_id}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 12 }} />
                        )}
                        ListEmptyComponent={
                            <View
                                style={{
                                    flex: 0,
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    alignSelf: "center",
                                }}
                            >
                                <ThemedText type="sub_heading">
                                    No comments yet
                                </ThemedText>
                                <ThemedText type="body_medium">
                                    Start the conversation.
                                </ThemedText>
                            </View>
                        }
                        renderItem={({ item }) => {
                            if (item.type === "expand_trigger") {
                                return (
                                    <Pressable
                                        onPress={() =>
                                            toggleExpandComment(
                                                item.parent_comment_id,
                                            )
                                        }
                                        style={{
                                            marginLeft: 36,
                                            paddingVertical: 4,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    height: 1,
                                                    width: 20,
                                                    backgroundColor:
                                                        Colors[colorScheme]
                                                            .border,
                                                }}
                                            />
                                            <ThemedText
                                                type="body_small"
                                                emphasized
                                                style={{
                                                    color: Colors[colorScheme]
                                                        .caption,
                                                }}
                                            >
                                                View {item.count} more{" "}
                                                {item.count > 1
                                                    ? "replies"
                                                    : "reply"}
                                            </ThemedText>
                                        </View>
                                    </Pressable>
                                );
                            }

                            if (item.type === "hide_trigger") {
                                return (
                                    <Pressable
                                        onPress={() =>
                                            toggleExpandComment(
                                                item.parent_comment_id,
                                            )
                                        }
                                        style={{
                                            marginLeft: 36,
                                            paddingVertical: 4,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    height: 1,
                                                    width: 20,
                                                    backgroundColor:
                                                        Colors[colorScheme]
                                                            .border,
                                                }}
                                            />
                                            <ThemedText
                                                type="body_small"
                                                emphasized
                                                style={{
                                                    color: Colors[colorScheme]
                                                        .caption,
                                                }}
                                            >
                                                Hide replies
                                            </ThemedText>
                                        </View>
                                    </Pressable>
                                );
                            }
                            const isReply = item.depth === 1;

                            return (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 12,
                                        // Indent based on depth (max out at 3-4 so it doesn't leave the screen)
                                        marginLeft: Math.min(
                                            item.depth * 36,
                                            100,
                                        ),
                                        paddingLeft: isReply ? 8 : 0,
                                    }}
                                >
                                    <Image
                                        source={require("@/assets/images/icon.png")}
                                        style={{
                                            width: isReply ? 28 : 36, // Smaller avatars for replies
                                            height: isReply ? 28 : 36,
                                            resizeMode: "contain",
                                            borderWidth: 1,
                                            borderColor:
                                                Colors[colorScheme].border,
                                            borderRadius: 100,
                                        }}
                                    />

                                    <View style={{ flex: 1 }}>
                                        <View>
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    gap: 4,
                                                    alignItems: "center",
                                                }}
                                            >
                                                <ThemedText
                                                    type="body_small"
                                                    emphasized
                                                >
                                                    {
                                                        item.commented_by_user_name
                                                    }
                                                </ThemedText>
                                                <ThemedText type="caption">
                                                    {item.displayTime}
                                                </ThemedText>
                                            </View>
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    gap: 4,
                                                    alignItems: "center",
                                                }}
                                            >
                                                <ThemedText type="body_small">
                                                    {isReply &&
                                                        item.reply_to_user_name && (
                                                            <ThemedText
                                                                type="body_small"
                                                                emphasized
                                                                style={{
                                                                    color: Colors[
                                                                        colorScheme
                                                                    ].tint,
                                                                }}
                                                            >
                                                                @
                                                                {
                                                                    item.reply_to_user_name
                                                                }{" "}
                                                            </ThemedText>
                                                        )}
                                                    {item.comment_text}
                                                </ThemedText>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 12,
                                            }}
                                        >
                                            <Pressable
                                                onPress={() =>
                                                    handleReply(
                                                        item.comment_id,
                                                        item.commented_by_user_name,
                                                        item.parent_comment_id,
                                                    )
                                                }
                                            >
                                                <ThemedText
                                                    type="caption"
                                                    emphasized
                                                    style={{
                                                        color: Colors[
                                                            colorScheme
                                                        ].caption,
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    Reply
                                                </ThemedText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() =>
                                                    setModalVisible(true)
                                                }
                                            >
                                                <Feather
                                                    size={14}
                                                    name="flag"
                                                />
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                        renderScrollComponent={BottomSheetFlashListScrollable}
                    />
                    <View
                        style={{
                            backgroundColor: Colors[colorScheme].bg_light,
                        }}
                    >
                        {commentParentId && (
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    backgroundColor: Colors[colorScheme].bg,
                                }}
                            >
                                <ThemedText type="caption">
                                    Replying to{" "}
                                    <ThemedText type="caption" emphasized>
                                        @{replyingToName}
                                    </ThemedText>
                                </ThemedText>
                                <Pressable onPress={cancelReply}>
                                    <MaterialCommunityIcons
                                        name="close-circle"
                                        size={18}
                                        color={Colors[colorScheme].caption}
                                    />
                                </Pressable>
                            </View>
                        )}
                        <View style={[styles.commentInputContainer]}>
                            <Image
                                source={require("@/assets/images/icon.png")}
                                style={{
                                    width: 36,
                                    height: 36,
                                    resizeMode: "contain",
                                    borderWidth: 1,
                                    borderColor: Colors[colorScheme].border,
                                    borderRadius: 100,
                                }}
                            />
                            <BottomSheetTextInput
                                ref={inputRef}
                                editable={!isPendingCommentCreate}
                                value={commentText}
                                onChangeText={setCommentText}
                                placeholder="Enter a comment..."
                                enterKeyHint="send"
                                onSubmitEditing={handleCommentSubmit}
                                style={[
                                    styles.commentInput,
                                    {
                                        borderColor:
                                            Colors[colorScheme].text_light,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheet>
            <Modal
                animationType="slide"
                visible={modalVisible}
                backdropColor={"hsla(0, 0%, 50%, 0.1)"}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                    setReportCommentId(null);
                }}
            >
                <View style={styles.centeredView}>
                    <View
                        style={[
                            styles.modalView,
                            { backgroundColor: Colors[colorScheme].bg_light },
                        ]}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={styles.modalText}
                        >
                            Report comment?
                        </ThemedText>
                        <View style={{ flexDirection: "row", gap: 24 }}>
                            <Pressable
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].text,
                                    },
                                ]}
                                onPress={() => {
                                    setModalVisible(false);
                                    setReportCommentId(null);
                                }}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                        {
                                            textAlign: "center",
                                            color: Colors[colorScheme]
                                                .button_text,
                                        },
                                    ]}
                                >
                                    Cancel
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme].alert_red,
                                    },
                                ]}
                                onPress={() => {}}
                            >
                                <ThemedText
                                    type="defaultSemiBold"
                                    style={[
                                        {
                                            textAlign: "center",
                                            color: Colors[colorScheme]
                                                .button_text,
                                        },
                                    ]}
                                >
                                    Report
                                </ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView>
    );
};

export default Comment;

const styles = StyleSheet.create({
    bottomSheet: {
        paddingVertical: 12,
        justifyContent: "space-between",
        height: "100%",
    },

    centeredView: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        width: "100%",
        gap: 16,
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
    modalText: {
        fontWeight: "bold",
    },
    button: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        elevation: 2,
    },
    commentsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
    },
    commentInputContainer: {
        gap: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    commentInput: {
        flex: 1,
        borderRadius: 8,
        minHeight: 32,
        maxHeight: 120,
        borderWidth: 1,
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 12,
        textAlignVertical: "center",
    },
});
