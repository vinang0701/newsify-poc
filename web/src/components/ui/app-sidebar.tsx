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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
    Award,
    Badge,
    ChevronDown,
    FileText,
    Flag,
    LayoutGrid,
    Plus,
    Tag,
    User2,
    Users2,
} from "lucide-react";

export function AppSidebar() {
    return (
        <Sidebar side={"left"} className="py-4">
            <SidebarHeader className="py-4">
                <img
                    src="icon.png"
                    alt="logo"
                    width={43}
                    className="object-contain self-center justify-center-self"
                />
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <LayoutGrid /> Dashboard
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <User2 /> Users
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <Users2 /> Communities
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <Tag /> Roles
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <Award /> Achievements
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <FileText /> Categories
                        </SidebarMenuButton>
                        <SidebarMenuButton>
                            <Flag /> Moderation
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    );
}
