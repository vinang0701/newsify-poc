import React, { useState, useCallback, useMemo } from "react";
import {
    useQuery,
    useQueryClient,
    useMutation,
    UseMutateFunction,
    RefetchOptions,
    QueryObserverResult,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { DraftData, ServerReponse } from "@/data/types";
import { Alert } from "react-native";

/**
 * Helper to extract img src from HTML string
 */
const extractImageUris = (html: string): string[] => {
    const imgTagRegex = /<img [^>]*src="([^"]+)"[^>]*>/g;
    const uris: string[] = [];
    let match;

    while ((match = imgTagRegex.exec(html)) !== null) {
        const uri = match[1];
        // Only include local URIs (e.g., file:// or common RN paths)
        // Skip existing https links if you don't want to re-upload them
        if (uri.startsWith("file") || uri.startsWith("content")) {
            uris.push(uri);
        }
    }
    return uris;
};

/**
 * Helper to format React Native files for FormData
 */
const appendFileToFormData = (formData: FormData, uri: string, key: string) => {
    const filename = uri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append(key, {
        uri: encodeURI(uri),
        name: filename,
        type,
    } as any);
};

export default function useDrafts() {
    const queryClient = useQueryClient();

    // only need to save thumbnail, title, content
    const { mutate: mu_saveDraft, isPending: isPendingSaveDraft } = useMutation(
        {
            mutationFn: async (data: DraftData) => {
                const formData = new FormData();
                const hasThumbnail = !!data.thumbnail;
                const hasTitle = data.title && data.title.trim().length > 0;
                const hasContent =
                    data.content && data.content.trim().length > 0;

                if (!hasThumbnail && !hasTitle && !hasContent) {
                    throw new Error(
                        "Cannot save an empty draft. Add a title, thumbnail, or content.",
                    );
                }

                if (hasContent) {
                    let processedContent = data.content!;
                    const localUris = extractImageUris(data.content!);

                    localUris.forEach((uri, index) => {
                        const placeholder = `CONTENT_IMG_${Date.now()}_${index}`;

                        // Replace URI with placeholder in the text
                        processedContent = processedContent.replace(
                            uri,
                            placeholder,
                        );

                        const match = /\.(\w+)$/.exec(uri);
                        const type = match ? `image/${match[1]}` : `image/jpeg`;

                        formData.append("content_images", {
                            uri: encodeURI(uri),
                            name: placeholder,
                            type: type,
                        } as any);
                    });

                    formData.append("content", processedContent);
                    console.log(processedContent!);
                }

                if (hasTitle) {
                    formData.append("title", data.title!);
                }

                if (data.draft_id) {
                    formData.append("draft_id", data.draft_id);
                }
                if (data.thumbnail) {
                    appendFileToFormData(formData, data.thumbnail, "thumbnail");
                }

                const response = await api.post(`/users/me/drafts`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                return response.data;
            },
            onError: (error: any) => {
                console.error(
                    "Mutation Error:",
                    error.response?.data || error.message,
                );
            },
        },
    );

    const { mutate: mu_deleteDraft, isPending: isPendingDeleteDraft } =
        useMutation({
            mutationFn: async (draft_id: string) => {
                const response = await api.delete(
                    `users/me/drafts/${draft_id}`,
                );
                return response.data;
            },
        });

    return {
        queryClient,
        mu_saveDraft,
        mu_deleteDraft,
        isPendingSaveDraft,
        isPendingDeleteDraft,
    };
}
