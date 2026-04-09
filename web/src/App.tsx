import { SidebarProvider } from "@/components/ui/sidebar";
import { InstitutionAdminSidebar } from "@/components/ui/institution-admin-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet, useLocation } from "react-router";
import { PlatformAdminSidebar } from "./components/ui/platform-admin-sidebar";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

function App() {
    // for now just use path
    const { pathname } = useLocation();
    const isInstitutionAdminPath = pathname.startsWith("/admin");
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
                <SidebarProvider defaultOpen={true}>
                    {isInstitutionAdminPath ? (
                        <InstitutionAdminSidebar />
                    ) : (
                        <PlatformAdminSidebar />
                    )}
                    <main className="w-full">
                        <Outlet />
                    </main>
                </SidebarProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
