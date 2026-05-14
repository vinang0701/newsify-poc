import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Category, UserPreference } from "@/data/types";

export function usePreferences() {
    const { user, session, metadata } = useAuthStore();
    const isReady = !!user && !!session && !!metadata;
    const inst_id = metadata?.inst_id;
    const userId = user?.id;
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const categoriesQuery = useQuery<Category[]>({
        queryKey: ["categories", inst_id],
        queryFn: async () => {
            const response = await api.get(`/${inst_id}/news/categories`);
            return response.data;
        },
    });

    const preferencesQuery = useQuery<UserPreference[]>({
        queryKey: ["user_preferences", inst_id, userId],
        queryFn: async () => {
            const response = await api.get(`/users/me/preferences`);
            const preferenceIds =
                response.data?.map(
                    (p: UserPreference) => p.category.category_id,
                ) || [];
            setSelectedIds(preferenceIds);
            return response.data;
        },
        enabled: isReady,
    });

    const isLoadingPreferences = preferencesQuery.isLoading;

    useEffect(() => {
        if (preferencesQuery.data) {
            const ids = preferencesQuery.data.map(
                (p) => p.category.category_id,
            );
            setSelectedIds(ids);
        }
    }, [preferencesQuery.data]);

    //called when user saves preferences
    //deletes old preferences, inserts new ones

    const savePreferences = useMutation({
        mutationFn: async (selectedCategories: string[]) => {
            const selectedPref = selectedCategories.map((id) => ({
                category_id: id,
                preference_type: "include",
            }));
            const response = await api.post("/users/me/preferences", {
                preferences: selectedPref,
            });
            return response.data;
        },
    });

    //return everything the screen needs to use
    return {
        categories: categoriesQuery.data, //all available categories
        preferences: preferencesQuery.data, //which ones the user has selected
        selectedIds,
        savePreferences: savePreferences.mutate, //function to save to DB
        loading:
            categoriesQuery.isLoading ||
            preferencesQuery.isLoading ||
            savePreferences.isPending,
        isRefreshing: categoriesQuery.isFetching || preferencesQuery.isFetching,
        error: categoriesQuery.error || preferencesQuery.error,
        refetch: () => {
            categoriesQuery.refetch();
            preferencesQuery.refetch();
        },
    };
}
