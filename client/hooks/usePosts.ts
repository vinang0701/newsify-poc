import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Alert } from "react-native";

export default function usePosts() {
    const { user, metadata } = useAuthStore();
    if (!user || !metadata) {
        return;
    }

    const queryClient = useQueryClient();

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

    const handleSuspend = async (news_id: string) => {
        // Add this safety check at the very top of handleSuspend:
        if (!user.id) {
            Alert.alert(
                "Error",
                "Could not verify your identity. Please try again.",
            );
            return;
        }

        mu_suspendPost(news_id);
    };
}
