import type { Users } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";

export const UserMgmtColumns: ColumnDef<Users>[] = [
    {
        accessorKey: "name",
        header: "Full Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
    },
    {
        accessorKey: "created_at",
        header: "Created at",
    },
    {
        accessorKey: "updated_at",
        header: "Updated at",
    },
];
