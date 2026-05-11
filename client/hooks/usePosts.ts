import { News } from "@/data/types";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Alert } from "react-native";

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

    return {
        postData,
        isLoading,
        suspendModalVisible,
        setSuspendModalVisible,
        mu_suspendPost,
        isPendingSuspendPost,
    };
}
