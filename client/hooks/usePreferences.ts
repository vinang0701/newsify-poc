//useState stores data that can change nd re-renders the screen when it does
//useEffect runs code when the component first load (empty[] means run once)
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { useQuery } from "@tanstack/react-query";
import { Category, UserPreference } from "@/data/types";

export function usePreferences() {
    const { user, session, metadata } = useAuthStore();
    if (!user || !metadata || !session) {
        throw new Error("Error occurred while retrieving user data.");
    }
    const inst_id = metadata.inst_id;
    const userId = user.id;

    //list of all categories from DB
    // const [categories, setCategories] = useState<any[]>([]);

    //list of categories user has ticked
    // const [preferences, setPreferences] = useState<string[]>([]);

    const categoriesQuery = useQuery<Category[]>({
        queryKey: ["categories", inst_id],
        queryFn: async () => {
            const response = await api.get(`${inst_id}/news/categories`);
            return response.data;
        },
        enabled: !!inst_id,
    });

    //fetch the current users already saved preferences from user_preferences table
    //this runs after we get the userid

    // useEffect(() => {
    //     if (!userId) return; // dont run if no userid yet
    //     setLoading(true);
    //     const fetchPreferences = async () => {
    //         try {
    //             const response = await api.get(
    //                 `${inst_id}/users/me/preferences`,
    //             );
    //             const initialSelected =
    //                 response.data?.map(
    //                     (p: UserPreference) => p.category.category_id,
    //                 ) || [];
    //             setPreferences(initialSelected);
    //             setLoading(false);
    //         } catch (error) {
    //             setLoading(false);
    //             console.error("Error fetching preferences:", error);
    //         }
    //     };
    //     fetchPreferences();
    // }, [userId, inst_id]); //re-run whenever userId changes (i.e once we get it)

    //called when a user selects a category
    //if already selected -> remove, if not add
    // const toggleCategory = (id: string) => {
    //     setPreferences(
    //         (prev) =>
    //             prev.includes(id)
    //                 ? prev.filter((c) => c !== id) //remove from array
    //                 : [...prev, id], //add to array
    //     );
    // };
    // 2. Fetch user preferences
    const preferencesQuery = useQuery({
        queryKey: ["user_preferences", inst_id, userId],
        queryFn: async () => {
            const response = await api.get(`${inst_id}/users/me/preferences`);
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
    const savePreferences = async () => {
        if (!userId) return false;
        try {
            const response = await api.post(
                `/${inst_id}/users/me/preferences`,
                {
                    category_ids: selectedIds,
                },
            );
            return response.data;
        } catch (error) {
            console.error("Error saving preferences:", error);
            return false;
        }
    };

    //return everything the screen needs to use
    return {
        categories: categoriesQuery.data ?? [], //all available categories
        preferences: selectedIds, //which ones the user has selected
        toggleCategory, //function to select/deselect a category
        savePreferences, //function to save to DB
        loading: categoriesQuery.isLoading || preferencesQuery.isLoading,
        isRefreshing: categoriesQuery.isFetching || preferencesQuery.isFetching,
        error: categoriesQuery.error || preferencesQuery.error,
        refetch: () => {
            categoriesQuery.refetch();
            preferencesQuery.refetch();
        },
    };
}
