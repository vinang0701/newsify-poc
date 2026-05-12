import { News, UpdatePostData } from "@/data/types";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
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

export default function usePosts(news_id?: string) {
    const queryClient = useQueryClient();
    const { metadata } = useAuthStore();

    const [suspendModalVisible, setSuspendModalVisible] = useState(false);

    const { mutate: mu_suspendPost, isPending: isPendingSuspendPost } =
        useMutation({
            mutationFn: async (news_id: string) => {
                const response = await api.delete(`/users/me/news/${news_id}`);
                return response.data;
            },
            onSuccess: (data: { status: string; message: string }) => {
                queryClient.invalidateQueries({ queryKey: ["news"] });
                queryClient.invalidateQueries({ queryKey: ["user_news"] });
                Alert.alert(data.status, data.message);
                setSuspendModalVisible(false);
            },

            onError: (err: any) => {
                Alert.alert("Error", err.message || "Failed to suspend post");
            },
        });

    const {
        data: postData,
        error: postDataError,
        isLoading,
    } = useQuery({
        queryKey: ["news_post"],
        queryFn: async (): Promise<News> => {
            const response = await api.get(
                `/${metadata?.inst_id}/news/${news_id}`,
            );
            return response.data;
        },
        enabled: !!news_id,
    });

    const mu_updatePost = useMutation({
        mutationFn: async (data: UpdatePostData) => {
            const formData = new FormData();
            // 1. Prepare Content (HTML) - Work on a copy to avoid mutating state directly
            let processedContent = data.content;

            // 2. Extract and Append Content Images
            const localUris = extractImageUris(data.content);
            // 3. Extract and Append Content Images
            localUris.forEach((uri, index) => {
                // Create a clean, unique placeholder for this specific image
                const placeholder = `CONTENT_IMG_${Date.now()}_${index}`;

                // SWAP: Replace the long file URI with the short placeholder in the HTML
                processedContent = processedContent.replace(uri, placeholder);

                // APPEND: Use the placeholder as the 'name' property
                const match = /\.(\w+)$/.exec(uri);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formData.append("content_images", {
                    uri: encodeURI(uri),
                    name: placeholder,
                    type: type,
                } as any);
            });

            // 1. Append Text Fields
            formData.append("title", data.title);
            formData.append(
                "description",
                data.description.trim().slice(0, 250),
            );
            formData.append("content", processedContent);

            // 2. Append Thumbnail
            if (data.thumbnail !== undefined) {
                appendFileToFormData(formData, data.thumbnail, "thumbnail");
            }

            console.log(formData);
            // return formData;

            const response = await api.patch(
                `/users/me/news/${news_id}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );

            return response.data;
        },
    });

    return {
        postData,
        isLoading,
        suspendModalVisible,
        setSuspendModalVisible,
        mu_suspendPost,
        isPendingSuspendPost,
        mu_updatePost,
    };
}
