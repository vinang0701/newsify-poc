import { useLoaderData, Outlet } from "react-router";
import type { Session } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/auth";

export function protectedLoader() {
    return requireAuth(); // returns session or redirects
}

export function ProtectedLayout() {
    const session = useLoaderData() as Session;
    // Optionally provide session via context here
    return <Outlet />;
}
