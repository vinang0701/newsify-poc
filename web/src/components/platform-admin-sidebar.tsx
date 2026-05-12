// ADD this import at the top
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutGrid, Users2 } from "lucide-react";
import { Link, useLocation } from "react-router";

export function PlatformAdminSidebar() {
	const { pathname } = useLocation();
	const navigate = useNavigate();

	return (
		<Sidebar side={"left"} className="">
			<SidebarHeader className="py-8">
				<img
					src="/icon.png"
					alt="logo"
					width={43}
					className="object-contain self-center justify-center-self"
				/>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu>
					<SidebarMenuItem className="px-2 gap-2">
						<SidebarMenuButton
							className="text-base h-10"
							isActive={pathname === "/platform"}
						>
							<Link
								to={"/platform"}
								className="w-full flex flex-row items-center gap-2"
							>
								<LayoutGrid size={16} />
								<span>Dashboard</span>
							</Link>
						</SidebarMenuButton>

						<SidebarMenuButton
							className="text-base h-10"
							isActive={pathname === "/platform/institutions"}
						>
							<Link
								to={"/platform/institutions"}
								className="w-full flex flex-row items-center gap-2"
							>
								<Users2 size={16} /> Institutions
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem className="px-2">
						<SidebarMenuButton
							className="text-base h-10 text-red-500 hover:text-red-600"
							onClick={async () => {
								await supabase.auth.signOut();
								navigate("/login");
							}}
						>
							<LogOut size={16} />
							<span>Log out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
