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
    Trash2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { CategoryTable } from "@/types";

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
    onHardDelete: (category: CategoryTable) => void;
}

const ActionButton = ({
    row,
    onEdit,
    onSuspend,
    onActivate,
    onHardDelete,
}: ActionButtonProps) => {
    const category = row.original;

    // Hard delete — permanently remove from DB

    return (
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
                        <DropdownMenuItem onClick={() => onActivate(category)}>
                            <CheckCircle />
                            <span>Activate</span>
                        </DropdownMenuItem>
                    )}
                    {/* Hard Delete — always available */}
                    <DropdownMenuItem
                        onClick={() => onHardDelete(category)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 />
                        <span>Delete Permanently</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const getCategoriesColumns = (
    onEdit: (category: CategoryTable) => void,
    onSuspend: (category: CategoryTable) => void,
    onActivate: (category: CategoryTable) => void,
    onHardDelete: (category: CategoryTable) => void,
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
                onHardDelete={onHardDelete}
            />
        ),
        minSize: 34,
    },
];
