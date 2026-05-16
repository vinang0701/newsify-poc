import { SidebarProvider } from "@/components/ui/sidebar";
import { InstitutionAdminSidebar } from "@/components/institution-admin-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    Outlet,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router";
import { PlatformAdminSidebar } from "./components/platform-admin-sidebar";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import Loading from "./components/loading";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

function App() {
    // for now just use path
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, loading } = useAuth();

    const isInstitutionAdminPath = useMemo(
        () => pathname.startsWith("/admin"),
        [pathname],
    );

    useEffect(() => {
        if (loading) return; // Wait for Supabase session initialization

        // Scenario 1: Not logged in -> Redirect to login page
        if (!user) {
            if (pathname !== "/login" && pathname !== "/forgot_password") {
                // Keep track of where they tried to go using query parameters
                navigate(`/login?next=${encodeURIComponent(pathname)}`, {
                    replace: true,
                });
            }
            return;
        }

        // Scenario 2: Logged in, and browsing the landing page or login portal -> Send them to their dashboard
        if (pathname === "/" || pathname === "/login") {
            const nextParam = searchParams.get("next");

            if (nextParam) {
                navigate(nextParam, { replace: true });
            } else if (user.role === "institution_admin") {
                navigate("/admin", { replace: true });
            } else if (user.role === "platform_admin") {
                navigate("/platform", { replace: true });
            } else {
                // Scenario 3: Logged in but has an unrecognized role assignment
                supabase.auth.signOut();
                alert("You do not have permission to access this portal.");
                navigate("/login", { replace: true });
            }
        }
    }, [user, loading, pathname, navigate, searchParams]);

    if (loading) {
        return <Loading />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
                <SidebarProvider defaultOpen={true}>
                    {isInstitutionAdminPath ? (
                        <InstitutionAdminSidebar />
                    ) : (
                        <PlatformAdminSidebar />
                    )}
                    <main className="w-full h-screen overflow-auto">
                        <Outlet />
                    </main>
                </SidebarProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
