import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getItem, setItem, deleteItemAsync } from "expo-secure-store";
import { Session, User, UserAppMetadata } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@supabase/supabase-js";

// Custom storage adapter for Supabase & Zustand
const SecureStorageAdapter = {
    getItem: (key: string) => getItem(key),
    setItem: (key: string, value: string) => setItem(key, value),
    removeItem: (key: string) => deleteItemAsync(key),
};

interface AppMetadata {
    inst_id: string;
    user_role: string;
}

type AuthState = {
    user: User | null;
    session: Session | null;
    metadata: AppMetadata | null;
    initialized: boolean;
    setAuth: (session: Session | null) => void;
    signOut: () => Promise<void>;
};
function extractAppMetadata(token: string | undefined): AppMetadata | null {
    if (!token) {
        return null;
    }
    try {
        const decoded = jwtDecode<JwtPayload & { app_metadata?: AppMetadata }>(
            token,
        );
        if (!decoded || !decoded.app_metadata) {
            return null;
        }

        return {
            inst_id: decoded.app_metadata.inst_id,
            user_role: decoded.app_metadata.user_role,
        };
    } catch (error) {
        console.error("JWT Extraction Error:", error);
        return null;
    }
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            session: null,
            metadata: null,
            initialized: false, // Useful to prevent "flicker" on app load
            setAuth: (session) => {
                const appMetadata = session?.access_token
                    ? extractAppMetadata(session.access_token)
                    : null;
                set({
                    session,
                    metadata: appMetadata,
                    user: session?.user ?? null,
                    initialized: true,
                });
            },
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
