import type { ColumnDef, Row } from "@tanstack/react-table";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { MoreVertical, UserPen, UserX, Shield, ShieldOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import UpdateUserDialog from "./update-form";

const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Singapore",
    })
        .format(new Date(dateString))
        .replace(",", "");
};

function titleCase(text: string) {
    return text.toLowerCase().replace(/(?:^|\s)\w/g, (match) =>
        match.toUpperCase()
    );
}

interface ActionButtonProps {
    row: Row<User>;
}

const actionConfig = {
    suspend: {
        label: "Suspend User",
        description:
            "Are you sure you want to suspend this user? They will not be able to login.",
        buttonClass: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    ban: {
        label: "Ban User",
        description:
            "Are you sure you want to ban this user? They will not be able to login.",
        buttonClass: "bg-destructive hover:bg-destructive/80 text-white",
    },
    "lift-ban": {
        label: "Lift Ban",
        description:
            "Are you sure you want to lift the ban? The user will be able to login again.",
        buttonClass: "bg-green-600 hover:bg-green-700 text-white",
    },

	"lift-suspension": {
		label: "Lift Suspension",
		description:
			"Are you sure you want to lift the suspension? The user will be able to login again.",
		buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
	},
};

const ActionButton = ({ row }: ActionButtonProps) => {
    const user = row.original;
    const queryClient = useQueryClient();

    const [confirmAction, setConfirmAction] = useState<
        "suspend" | "ban" | "lift-ban" | "lift-suspension" | null
    >(null);
    const [loading, setLoading] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);

    const isBanned = user.status === "banned";
    const isSuspended = user.status === "suspended";

    const handleConfirm = async () => {
        if (!confirmAction) return;
        setLoading(true);
        try {
            await api.patch(
                `/${inst_id}/admin/users/${user.id}/${confirmAction}`
            );
            queryClient.invalidateQueries({ queryKey: ["studentUsers"] });
            setConfirmAction(null);
        } catch (err) {
            console.error("Action failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {confirmAction && (
                <Dialog
                    open={!!confirmAction}
                    onOpenChange={() => setConfirmAction(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {actionConfig[confirmAction].label}
                            </DialogTitle>
                            <DialogDescription>
                                {actionConfig[confirmAction].description}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                className={actionConfig[confirmAction].buttonClass}
                                onClick={handleConfirm}
                                disabled={loading}
                            >
                                {loading
                                    ? "Processing..."
                                    : actionConfig[confirmAction].label}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild className="w-fit cursor-pointer">
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical size={8} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
                            <UserPen />
                            <span>Update</span>
                        </DropdownMenuItem>
                        <Separator orientation="horizontal" />
                        {isBanned ? (
                            <DropdownMenuItem
                                onClick={() => setConfirmAction("lift-ban")}
                                className="text-green-600 focus:text-green-600"
                            >
                                <ShieldOff />
                                <span>Lift Ban</span>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                onClick={() => setConfirmAction("ban")}
                                className="text-destructive focus:text-destructive"
                            >
                                <Shield />
                                <span>Ban</span>
                            </DropdownMenuItem>
                        )}
                        <Separator orientation="horizontal" />
                        {isSuspended ? (
                            <DropdownMenuItem
                                onClick={() => setConfirmAction("lift-suspension")}
                                className="text-blue-600 focus:text-blue-600"
                            >
                                <UserX />
                                <span>Lift Suspension</span>
                            </DropdownMenuItem>
						
						):(
							// Only show Suspend if user is not banned
							!isBanned && (
								<DropdownMenuItem
									onClick={() => setConfirmAction("suspend")}
									className="text-orange-500 focus:text-orange-500"
								>
									<UserX />
									<span>Suspend</span>
								</DropdownMenuItem>
							)

                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <UpdateUserDialog
                user={user}
                open={updateOpen}
                onClose={() => setUpdateOpen(false)}
            />
        </>
    );
};

export const UserMgmtColumns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "Full Name",
        minSize: 280,
    },
    {
        accessorKey: "email",
        header: "Email",
        minSize: 280,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => titleCase(row.original.role),
        minSize: 80,
    },
    {
        accessorKey: "created_at",
        header: "Created at",
        cell: (info) => formatDate(info?.getValue() as string),
        minSize: 160,
    },
    {
        accessorKey: "updated_at",
        header: "Updated at",
        cell: (info) => formatDate(info?.getValue() as string),
        minSize: 160,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => titleCase(row.original.status),
        minSize: 80,
    },
    {
        id: "action",
        cell: ({ row }) => <ActionButton row={row} />,
        minSize: 34,
    },
];