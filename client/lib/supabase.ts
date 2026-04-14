import { createClient } from "@supabase/supabase-js";
import { useAuthStore } from "@/utils/authStore";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";

const SecureStorageAdapter = {
    getItem: (key: string) => getItem(key),
    setItem: (key: string, value: string) => setItem(key, value),
    removeItem: (key: string) => deleteItemAsync(key),
};
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: SecureStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// The "Magic" Listener
supabase.auth.onAuthStateChange((_event, session) => {
    console.log("🔔 Auth State Changed:", _event);
    console.log("👤 User in Session:", session?.user?.email ?? "No User");
    useAuthStore.getState().setAuth(session);
});
