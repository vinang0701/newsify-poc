//useState stores data that can change nd re-renders the screen when it does
//useEffect runs code when the component first load (empty[] means run once)
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import api from "@/lib/axios";
import { useAuthStore } from "@/utils/authStore";
import { useQuery } from "@tanstack/react-query";
import { UserPreference } from "@/data/types";

export function usePreferences() {
    const { user, session, metadata } = useAuthStore();
    if (!user || !metadata) {
        throw new Error("Error occurred while retrieving user data.");
    }
    const inst_id = metadata.inst_id;
    const userId = user.id;

    //list of all categories from DB
    const [categories, setCategories] = useState<any[]>([]);

    //list of categories user has ticked
    const [selected, setSelected] = useState<string[]>([]);

    //loading = true while we are still fetching from DB. false when done
    const [loading, setLoading] = useState(true);

    //fetch all active categories from the categories table
    //these are the buttons the user can tap to select
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get(`/${inst_id}/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [inst_id]); // [] only run once on load

    //fetch the current users already saved preferences from user_preferences table
    //this runs after we get the userid

    useEffect(() => {
        if (!userId) return; // dont run if no userid yet
        setLoading(true);
        const fetchPreferences = async () => {
            try {
                const response = await api.get(
                    `${inst_id}/users/me/preferences`,
                );
                const initialSelected =
                    response.data?.map(
                        (p: UserPreference) => p.category.category_id,
                    ) || [];
                setSelected(initialSelected);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Error fetching preferences:", error);
            }
        };
        fetchPreferences();
    }, [userId, inst_id]); //re-run whenever userId changes (i.e once we get it)

    //called when a user selects a category
    //if already selected -> remove, if not add
    const toggleCategory = (id: string) => {
        setSelected(
            (prev) =>
                prev.includes(id)
                    ? prev.filter((c) => c !== id) //remove from array
                    : [...prev, id], //add to array
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
                    category_ids: selected,
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
        categories, //all available categories
        selected, //which ones the user has selected
        toggleCategory, //function to select/deselect a category
        savePreferences, //function to save to DB
        loading, //whether we are still fetching
    };
}
