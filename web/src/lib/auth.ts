import { redirect } from "react-router";
import { supabase } from "@/lib/supabase";

export async function requireAuth({ request }: { request: Request }) {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
        const url = new URL(request.url);
        throw redirect(`/login?next=${encodeURIComponent(url.pathname)}`);
    }
    return session;
}

// Optional: redirect away if already logged in
export async function requireGuest() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) throw redirect("/admin");
    return null;
}

export async function requireInstitutionAdmin() {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (authError || !user || !session) {
        throw redirect("/login");
    }

    const payload = JSON.parse(atob(session.access_token.split(".")[1]));
    console.log(payload.app_metadata.user_role);
    console.log(payload.app_metadata.inst_id);

    if (payload.app_metadata.user_role.toLowerCase() !== "institution_admin") {
        if (user?.app_metadata?.user_role !== "institution_admin") {
            await supabase.auth.signOut(); // Kill the session
            throw redirect("/login?error=unauthorized");
        }
    }
    return { session };
}
