import type { ColumnDef, Row } from "@tanstack/react-table";
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
import {
    Edit3,
    MoreVertical,
    PauseCircle,
    CheckCircle,
    ShieldOff,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { CategoryTable } from "@/types";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
    return text.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
        return match.toUpperCase();
    });
}

interface ActionButtonProps {
    row: Row<CategoryTable>;
    onEdit: (category: CategoryTable) => void;
    onSuspend: (category: CategoryTable) => void;
    onActivate: (category: CategoryTable) => void;
}

const ActionButton = ({
    row,
    onEdit,
    onSuspend,
    onActivate,
}: ActionButtonProps) => {
    const category = row.original;
    const queryClient = useQueryClient();
    const [editOpen, setEditOpen] = useState(false);
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [hardDeleteOpen, setHardDeleteOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hardDeleteError, setHardDeleteError] = useState<string | null>(null);

    const [editName, setEditName] = useState(category.category_name);
    const [editStatus, setEditStatus] = useState(category.status);

    // Check if category is active or inactive
    const isActive = category.status === "active";

    const handleEdit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("category_name", editName);
            formData.append("status", editStatus);
            await api.patch(
                `/${inst_id}/admin/categories/${category.category_id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            );
            queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
            setEditOpen(false);
        } catch (err) {
            console.error("Edit failed:", err);
        } finally {
            setLoading(false);
        }
    };

    // Soft delete — set status to inactive
    const handleDeactivate = async () => {
        setLoading(true);
        try {
            await api.delete(
                `/${inst_id}/admin/categories/${category.category_id}`,
            );
            queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
            setDeactivateOpen(false);
        } catch (err) {
            console.error("Deactivate failed:", err);
        } finally {
            setLoading(false);
        }
    };

    // Activate — set status back to active
    const handleActivate = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("category_name", category.category_name);
            formData.append("status", "active");
            await api.patch(
                `/${inst_id}/admin/categories/${category.category_id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            );
            queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
        } catch (err) {
            console.error("Activate failed:", err);
        } finally {
            setLoading(false);
        }
    };

    // Hard delete — permanently remove from DB
    const handleHardDelete = async () => {
        setLoading(true);
        setHardDeleteError(null);
        try {
            await api.delete(
                `/${inst_id}/admin/categories/${category.category_id}?hard=true`,
            );
            queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
            setHardDeleteOpen(false);
        } catch (err: any) {
            // Show the error message from backend
            setHardDeleteError(
                err.response?.data?.detail || "Could not delete category.",
            );
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the category details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Category Name
                            </label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter category name"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Status
                            </label>
                            <Select
                                value={editStatus}
                                onValueChange={setEditStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleEdit}
                            disabled={loading || !editName.trim()}
                        >
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deactivate Confirmation Dialog */}
            <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate "
                            {category.category_name}"? It will no longer appear
                            in the app but can be reactivated.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={handleDeactivate}
                            disabled={loading}
                        >
                            {loading ? "Deactivating..." : "Deactivate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Hard Delete Confirmation Dialog */}
            <Dialog
                open={hardDeleteOpen}
                onOpenChange={() => {
                    setHardDeleteOpen(false);
                    setHardDeleteError(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Permanently Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete "
                            {category.category_name}"? This action{" "}
                            <span className="font-bold text-destructive">
                                cannot be undone
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>
                    {/* Show error if category is in use */}
                    {hardDeleteError && (
                        <p className="text-sm text-destructive">
                            {hardDeleteError}
                        </p>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                onClick={() => setHardDeleteError(null)}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            className="bg-destructive hover:bg-destructive/80 text-white"
                            onClick={handleHardDelete}
                            disabled={loading}
                        >
                            {loading ? "Deleting..." : "Delete Permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="w-fit cursor-pointer">
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical size={8} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                            <Edit3 />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <Separator orientation="horizontal" />
                        {category.status !== "inactive" ? (
                            <DropdownMenuItem
                                onClick={() => onSuspend(category)}
                                className="text-destructive focus:text-destructive"
                            >
                                <PauseCircle />
                                <span>Suspend</span>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                onClick={() => onActivate(category)}
                            >
                                <CheckCircle />
                                <span>Activate</span>
                            </DropdownMenuItem>
                        )}
                        {/* Hard Delete — always available */}
                        <DropdownMenuItem
                            onClick={() => setHardDeleteOpen(true)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 />
                            <span>Delete Permanently</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export const getCategoriesColumns = (
    onEdit: (category: CategoryTable) => void,
    onSuspend: (category: CategoryTable) => void,
    onActivate: (category: CategoryTable) => void,
): ColumnDef<CategoryTable>[] => [
    {
        accessorKey: "category_name",
        header: "Category",
        minSize: 280,
    },
    {
        accessorKey: "created_by",
        header: "Added By",
        minSize: 160,
    },
    {
        accessorKey: "created_at",
        header: "Date Added",
        cell: (info) => formatDate(info?.getValue() as string),
        minSize: 160,
    },
    {
        accessorKey: "updated_at",
        header: "Date Updated",
        cell: (info) => formatDate(info?.getValue() as string),
        minSize: 160,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <span
                className={
                    row.original.status === "inactive"
                        ? "text-destructive font-medium"
                        : "text-green-600 font-medium"
                }
            >
                {titleCase(row.original.status)}
            </span>
        ),
        minSize: 80,
    },
    {
        id: "action",
        cell: ({ row }) => (
            <ActionButton
                row={row}
                onEdit={onEdit}
                onSuspend={onSuspend}
                onActivate={onActivate}
            />
        ),
        minSize: 34,
    },
];
