import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	Award,
	ChevronRight,
	FileText,
	Flag,
	LayoutGrid,
	Tag,
	User2,
	Users2,
} from "lucide-react";
import { Link, useLocation } from "react-router";

export function PlatformAdminSidebar() {
	const { pathname } = useLocation();

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
			<SidebarFooter />
		</Sidebar>
	);
}
