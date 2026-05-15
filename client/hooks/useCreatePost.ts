import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { PostData } from "@/data/types";

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
export const appendFileToFormData = (
    formData: FormData,
    uri: string,
    key: string,
) => {
    const filename = uri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append(key, {
        uri: encodeURI(uri),
        name: filename,
        type,
    } as any);
};

export default function useCreatePost() {
    const { user, metadata } = useAuthStore();

    const queryClient = useQueryClient();

    const { mutate, isPending, error } = useMutation({
        mutationFn: async (data: PostData) => {
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
                    name: placeholder, // This MUST match the string in processedContent
                    type: type,
                } as any);
            });

            // 1. Append Text Fields
            formData.append("title", data.title.trim());
            formData.append(
                "description",
                data.description.trim().slice(0, 250),
            );
            formData.append("content", processedContent);

            if (data.selectedCategoryId) {
                formData.append("category_id", data.selectedCategoryId);
            }
            formData.append("destination", data.destination);
            formData.append("is_public", String(data.is_public));

            if (data.destination === "COMMUNITY" && data.selectedCommunityId) {
                formData.append("community_id", data.selectedCommunityId);
            }

            // 2. Append Thumbnail
            if (data.thumbnail !== undefined) {
                appendFileToFormData(formData, data.thumbnail, "thumbnail");
            }

            if (data.draft_id) {
                formData.append("draft_id", data.draft_id);
            }

            // return formData;

            const response = await api.post(`/users/me/news`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return response.data;
        },
        onSuccess: () => {
            // Invalidate queries so the "Feed" or "My Posts" list refreshes
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error: any) => {
            console.error(
                "Mutation Error:",
                error.response?.data || error.message,
            );
        },
    });
    return { mutate, isPending, error };
}

// const isPublic = data.destination === "PUBLIC";
// const communityId =
//     data.destination === "COMMUNITY"
//         ? data.selectedCommunityId
//         : null;
