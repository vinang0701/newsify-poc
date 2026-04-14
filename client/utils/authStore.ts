import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Custom storage adapter for Supabase & Zustand
const SecureStorageAdapter = {
    getItem: (key: string) => getItem(key),
    setItem: (key: string, value: string) => setItem(key, value),
    removeItem: (key: string) => deleteItemAsync(key),
};

type AuthState = {
    user: User | null;
    session: Session | null;
    initialized: boolean;
    setAuth: (session: Session | null) => void;
    signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            session: null,
            initialized: false, // Useful to prevent "flicker" on app load
            setAuth: (session) =>
                set({
                    session,
                    user: session?.user ?? null,
                    initialized: true,
                }),
            signOut: async () => {
                await supabase.auth.signOut();
                set({ user: null, session: null });
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => SecureStorageAdapter),
        },
    ),
);
