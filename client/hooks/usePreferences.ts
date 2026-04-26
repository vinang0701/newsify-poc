//useState stores data that can change nd re-renders the screen when it does
//useEffect runs code when the component first load (empty[] means run once)
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function usePreferences() {

    //list of all categories from DB
    const [categories, setCategories] = useState<any[]>([]);

    //list of categories user has ticked
    const [selected, setSelected] = useState<string[]>([]);

    //loading = true while we are still fetching from DB. false when done
    const [loading, setLoading] = useState(true);

    //userID = logged in user id. we need this to save/fetch their preferences
    const [userId, setUserId] = useState<string | null>(null);

    //ask supabase who is currently logged in and save their id
    useEffect( () => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []); //[] only run once on load


    //fetch all active categories from the categories table
    //these are the buttons the user can tap to select
    useEffect(() => {
        const fetchCategories = async () => {
            const {data} = await supabase
                .from("categories")
                .select("category_id, category_name")
                .eq("status", "active");
            setCategories(data || []);
            setLoading(false)
        };
        fetchCategories();
    }, []); // [] only run once on load

    //fetch the current users already saved preferences from user_preferences table
    //this runs after we get the userid
    useEffect ( () => {
        if (!userId) return; // dont run if no userid yet
        const fetchPreferences = async () => {
            const { data } = await supabase
                .from("user_preferences")
                .select("category_id")
                .eq("user_id", userId)
                .eq("preference_type", "include"); //only pre-select included categories
            
            //extract just the category_id values into a flat array like:
            //["uuid-1", "uuid-2"]
            setSelected(data?.map((p) => p.category_id) || []);
        };
        fetchPreferences();
    }, [userId]); //re-run whenever userId changes (i.e once we get it)

    //called when a user selects a category
    //if already selected -> remove, if not add
    const toggleCategory = (id:string) => {
        setSelected((prev) => 
            prev.includes(id)
                ? prev.filter((c) => c !== id) //remove from array
                : [...prev, id]                //add to array
        );
    };

    //called when user saves preferences
    //deletes old preferences, inserts new ones
    const savePreferences = async () => {
        if (!userId) return false;

        //step1: delete all existing preference for the user
        //avoid duplications instead of checking what changed
        await supabase
            .from("user_preferences")
            .delete()
            .eq("user_id", userId);

        //step2: build an array of rows to insert
        //each selected category becomes one row in user_preferences
        const rows = selected.map((category_id) => ({
            user_id: userId,
            category_id,
            preference_type: "category",
        }));

        //step3: insert all new rows at once
        const {error} = await supabase
            .from("user_preferences")
            .insert(rows);
        
        return !error; //return true if no error, false if something went wrong
    };


    //return everything the screen needs to use
    return {
        categories, //all available categories
        selected,   //which ones the user has selected
        toggleCategory, //function to select/deselect a category
        savePreferences, //function to save to DB
        loading,    //whether we are still fetching
    };

}