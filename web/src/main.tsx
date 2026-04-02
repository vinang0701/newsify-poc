import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import { AppSidebar } from "./components/ui/app-sidebar.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <TooltipProvider delayDuration={0}>
                <SidebarProvider defaultOpen={true}>
                    <AppSidebar />
                    <main className="w-full">
                        <App />
                    </main>
                </SidebarProvider>
            </TooltipProvider>
        </BrowserRouter>
    </StrictMode>,
);
