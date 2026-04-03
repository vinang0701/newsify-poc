import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet } from "react-router";
function App() {
    return (
        <TooltipProvider delayDuration={0}>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <main className="w-full">
                    <Outlet />
                </main>
            </SidebarProvider>
        </TooltipProvider>
    );
}

export default App;
