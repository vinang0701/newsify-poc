import { SidebarProvider } from "@/components/ui/sidebar";
import { InstitutionAdminSidebar } from "@/components/institution-admin-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet, useLocation } from "react-router";
import { PlatformAdminSidebar } from "./components/platform-admin-sidebar";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

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
    const isInstitutionAdminPath = useMemo(
        () => pathname.startsWith("/admin"),
        [pathname],
    );

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
