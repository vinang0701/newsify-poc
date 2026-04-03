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
import { Link, useLocation, useNavigate } from "react-router";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <Sidebar side={"left"} className="">
            <SidebarHeader className="py-8">
                <img
                    src="/public/icon.png"
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
                            isActive={pathname === "/admin"}
                        >
                            <Link
                                to={"/admin"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <LayoutGrid size={16} />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                        <Collapsible
                            defaultOpen={false}
                            className="group/collapsible"
                        >
                            <SidebarGroup>
                                <SidebarGroupLabel
                                    className="w-full flex gap-2 px-2 text-text font-normal cursor-pointer hover:bg-sidebar-accent text-base font-regular h-10 justify-between"
                                    asChild
                                >
                                    <CollapsibleTrigger className="w-full ">
                                        <User2 size={16} />
                                        <span>Users</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent className="border-l border-border mx-4 px-2">
                                    <Link to={"#"}>
                                        <SidebarMenuButton>
                                            Student
                                        </SidebarMenuButton>
                                    </Link>
                                    <Link to={"#"}>
                                        <SidebarMenuButton>
                                            Staff
                                        </SidebarMenuButton>
                                    </Link>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                        <SidebarMenuButton
                            className="text-base h-10"
                            isActive={pathname === "/admin/communities"}
                        >
                            <Link
                                to={"/admin/communities"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <Users2 size={16} /> Communities
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton className="text-base h-10">
                            <Link
                                to={"/admin"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <Tag size={16} /> Roles
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton className="text-base h-10">
                            <Link
                                to={"/admin"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <Award size={16} /> Achievements
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton className="text-base h-10">
                            <Link
                                to={"/admin"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <FileText size={16} /> Categories
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton className="text-base h-10">
                            <Link
                                to={"/admin"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <Flag size={16} /> Moderation
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    );
}
