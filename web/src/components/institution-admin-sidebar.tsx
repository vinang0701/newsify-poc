import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    Award,
    ChevronRight,
    FileText,
    Flag,
    LayoutGrid,
    LogOut,
    Tag,
    User2,
    Users2,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/lib/supabase";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export function InstitutionAdminSidebar() {
    const [dialogVisible, setDialogVisible] = useState(false);
    const { pathname, search } = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        setIsLoading(true);

        if (!error) {
            location.reload();
        }
    }

    useEffect(() => {
        const handleBlur = () => setDialogVisible(false);
        handleBlur();
    }, [pathname, search]);

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
                                    <Link to={"/admin/users/students"}>
                                        <SidebarMenuButton>
                                            Students
                                        </SidebarMenuButton>
                                    </Link>
                                    <Link to={"/admin/users/staff"}>
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
                        <SidebarMenuButton
                            className="text-base h-10"
                            isActive={pathname === "/admin/roles"}
                        >
                            <Link
                                to={"/admin/roles"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <Tag size={16} /> Roles
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                            className="text-base h-10"
                            isActive={pathname === "/admin/achievements"}
                        >
                            <Link
                                to={"/admin/achievements"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <Award size={16} /> Achievements
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                            className="text-base h-10"
                            isActive={pathname === "/admin/categories"}
                        >
                            <Link
                                to={"/admin/categories"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <FileText size={16} /> Categories
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton
                            className="text-base h-10"
                            isActive={pathname === "/admin/moderation"}
                        >
                            <Link
                                to={"/admin/moderation"}
                                className="w-full flex flex-row items-center gap-2"
                            >
                                <Flag size={16} /> Moderation
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Dialog
                            open={dialogVisible}
                            onOpenChange={() =>
                                setDialogVisible(!dialogVisible)
                            }
                        >
                            <DialogTrigger className="flex px-2 cursor-pointer w-full text-base h-10 items-center gap-2 hover:bg-sidebar-accent rounded-md">
                                <LogOut size={16} /> <span>Log out</span>
                            </DialogTrigger>

                            <DialogContent className="px-6 py-4">
                                <DialogHeader>
                                    <DialogTitle>Log out</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to log out?
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-row justify-between gap-6 ">
                                    <Button
                                        variant="black"
                                        onClick={() => setDialogVisible(false)}
                                        className="rounded-3xl flex-grow text-base py-2 "
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={signOut}
                                        disabled={isLoading}
                                        className="rounded-3xl flex-grow bg-red-500 hover:bg-red-400 text-base py-2"
                                    >
                                        Log out
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
