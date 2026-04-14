import { supabase } from "@/lib/supabase";
import type { UserAuth } from "@/types";
import { createContext, useState, useEffect, useContext } from "react";
import type { PropsWithChildren } from "react";

interface AuthContextType {
    user: UserAuth | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function parseUserFromSession(
    session: NonNullable<
        Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
    >,
): UserAuth {
    const payload = JSON.parse(atob(session.access_token.split(".")[1]));
    const app_metadata = payload.app_metadata;

    return {
        id: session.user.id,
        inst_id: app_metadata?.inst_id,
        name: app_metadata?.name,
        email: session.user.email ?? "",
        role: app_metadata?.user_role,
    };
}
export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<UserAuth | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Load initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session ? parseUserFromSession(session) : null);
            setLoading(false);
            console.log(session?.access_token);
        });

        // 2. Keep in sync with auth state changes (login, logout, token refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session ? parseUserFromSession(session) : null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
// export default async function AuthProvider({ children }: PropsWithChildren) {
//     const [user, setUser] = useState<UserAuth | null>(null);
//     const [loading, setLoading] = useState(true);
//     const {
//         data: { session },
//         error,
//     } = await supabase.auth.getSession();

//     if (!session) {
//         throw new Error(
//             "Error: Something went wrong while fetching user data.",
//         );
//     }

//     if (error) {
//         throw error;
//     }

//     const payload = JSON.parse(atob(session.access_token.split(".")[1]));

//     const app_metadata = payload.app_metadata;
//     const inst_id = app_metadata?.inst_id;
//     const role = app_metadata?.role;
//     const name = app_metadata?.name;

//     const user: UserAuth = {
//         id: session.user.id,
//         inst_id: inst_id,
//         name,
//         email: session.user.email ?? "",
//         role: role,
//     };

//     return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
// }

// export const useAuth = () => {
//     const context = useContext(AuthContext);

//     if (context === undefined) {
//         throw new Error("useAuth must be used within AuthProvider");
//     }

//     return context;
// };
