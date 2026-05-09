//useState stores data that can change nd re-renders the screen when it does
//useEffect runs code when the component first load (empty[] means run once)
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Category, UserPreference } from "@/data/types";

export function usePreferences() {
    const { user, session, metadata } = useAuthStore();
    if (!user || !metadata || !session) {
        throw new Error("Error occurred while retrieving user data.");
    }
    const inst_id = metadata.inst_id;
    const userId = user.id;

    const categoriesQuery = useQuery<Category[]>({
        queryKey: ["categories", inst_id],
        queryFn: async () => {
            const response = await api.get(`/${inst_id}/news/categories`);
            return response.data;
        },
    });

    const preferencesQuery = useQuery({
        queryKey: ["user_preferences", inst_id, userId],
        queryFn: async () => {
            const response = await api.get(`/users/me/preferences`);
            return (
                response.data?.map(
                    (p: UserPreference) => p.category.category_id,
                ) || []
            );
        },
        enabled: !!inst_id && !!userId,
    });

    // 3. Local state for the "Ticked" UI
    // We initialize this in a useEffect when preferencesQuery data arrives
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (preferencesQuery.data) {
            setSelectedIds(preferencesQuery.data);
        }
    }, [preferencesQuery.data]);

    const toggleCategory = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
        );
    };

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
        preferences: selectedIds, //which ones the user has selected
        toggleCategory, //function to select/deselect a category
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
