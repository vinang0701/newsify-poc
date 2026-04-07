import { SidebarProvider } from "@/components/ui/sidebar";
import { InstitutionAdminSidebar } from "@/components/ui/institution-admin-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet, useLocation } from "react-router";
import { PlatformAdminSidebar } from "./components/ui/platform-admin-sidebar";
function App() {
	// for now just use path
	const { pathname } = useLocation();
	const isInstitutionAdminPath = pathname.startsWith("/admin");
	return (
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
	);
}

export default App;
