import {
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

    // from comments modal
    const colorScheme = useColorScheme() ?? "light";
    // const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const { user, metadata, session } = useAuthStore();
    const [commentText, setCommentText] = useState("");
    const [commentParentId, setCommentParentId] = useState<string | undefined>(
        undefined,
    );
    const BottomSheetFlashListScrollable = useBottomSheetScrollableCreator();
    useEffect(() => {
        console.log(session?.access_token);
    }, []);

    if (!metadata) {
        console.error("Unable to retrieve metadata from JWt.");
    }
    const inst_id = metadata?.inst_id;
    const params = useLocalSearchParams<{
        post_id: string;
    }>();

    const post_id = params.post_id;

    const fetchPostComments = async (): Promise<PostComment[]> => {
        try {
            const response = await api.get(
                `${inst_id}/news/${post_id}/comments`,
            );

            return response.data;
        } catch (error) {
            throw new Error(
                "Error occurred while fetching post comments: " + error,
            );
        }
    };

    const { data: comment_data, error: comment_error } = useQuery<
        PostComment[]
    >({
        queryKey: ["comments", post_id],
        queryFn: fetchPostComments,
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
    const handleReply = (commentId: string, name: string) => {
        setCommentParentId(commentId);
        setReplyingToName(name);

        // Smoothly focus the input
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

    // Testing flattening data
    const flattenComments = (comments: any[]) => {
        const map = new Map();
        const roots: any[] = [];

        // 1. Initialize map with depth 0
        comments.forEach((c) => {
            map.set(c.comment_id, { ...c, replies: [], depth: 0 });
        });

        // 2. Attach replies to parents
        const flattened: any[] = [];
        const traverse = (node: any, depth: number) => {
            flattened.push({ ...node, depth });
            const replies = comments
                .filter((c) => c.parent_comment_id === node.comment_id)
                .sort(
                    (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime(),
                );

            replies.forEach((reply) =>
                traverse(map.get(reply.comment_id), depth + 1),
            );
        };

        // 3. Find top-level comments and start traversal
        comments
            .filter((c) => !c.parent_comment_id)
            .forEach((root) => traverse(map.get(root.comment_id), 0));

        return flattened;
    };

    const processedComments: any[] = useMemo(
        () => (comment_data ? flattenComments(comment_data) : []),
        [comment_data],
    );

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
                            const isReply = item.depth > 0;

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
                                                {item.commented_by_user_name}
                                            </ThemedText>
                                            <ThemedText type="caption">
                                                1d
                                            </ThemedText>
                                        </View>

                                        <ThemedText type="body_small">
                                            {item.comment_text}
                                        </ThemedText>

                                        <Pressable
                                            onPress={() =>
                                                handleReply(
                                                    item.comment_id,
                                                    item.commented_by_user_name,
                                                )
                                            }
                                        >
                                            <ThemedText
                                                type="caption"
                                                emphasized
                                                style={{
                                                    color: Colors[colorScheme]
                                                        .caption,
                                                    marginTop: 4,
                                                }}
                                            >
                                                Reply
                                            </ThemedText>
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        }}
                        // renderItem={({ item }) => (
                        //     <View
                        //         style={{
                        //             flexDirection: "row",
                        //             gap: 12,
                        //         }}
                        //     >
                        //         {/* Image */}
                        //         <Image
                        //             source={require("@/assets/images/icon.png")}
                        //             style={{
                        //                 width: 36,
                        //                 height: 36,
                        //                 resizeMode: "contain",
                        //                 borderWidth: 1,
                        //                 borderColor: Colors[colorScheme].border,
                        //                 borderRadius: 100,
                        //             }}
                        //         />
                        //         {/* Info Container */}
                        //         <View>
                        //             <View
                        //                 style={{ flexDirection: "row", gap: 4 }}
                        //             >
                        //                 <ThemedText
                        //                     type="body_small"
                        //                     emphasized
                        //                 >
                        //                     {item.commented_by_user_name}
                        //                 </ThemedText>
                        //                 <ThemedText type="caption">
                        //                     1d
                        //                 </ThemedText>
                        //             </View>
                        //             <ThemedText type="body_small">
                        //                 {item.comment_text}
                        //             </ThemedText>
                        //             <Pressable
                        //                 onPress={() =>
                        //                     handleReply(
                        //                         item.comment_id,
                        //                         item.commented_by_user_name,
                        //                     )
                        //                 }
                        //             >
                        //                 <ThemedText
                        //                     type="caption"
                        //                     emphasized
                        //                     style={{
                        //                         color: Colors[colorScheme]
                        //                             .caption,
                        //                     }}
                        //                 >
                        //                     Reply
                        //                 </ThemedText>
                        //             </Pressable>
                        //         </View>
                        //     </View>
                        // )}
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
                                    Replying to
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
    modalActionButtonCtn: {
        flex: 0,
        flexDirection: "row",
        gap: 8,
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
