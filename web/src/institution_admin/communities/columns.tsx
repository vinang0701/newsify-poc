import type { ColumnDef, Row } from "@tanstack/react-table";
import type { Community, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserPen, UserX } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

interface ActionButtonProps {
	row: Row<User>;
}

function titleCase(str: string) {
	return str.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
		return match.toUpperCase();
	});
}

const ActionButton = ({ row }: ActionButtonProps) => {
	const user = row.original;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="w-fit cursor-pointer">
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreVertical size={8} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={() => console.log("Update", user.id)}
					>
						<UserPen />
						<span>Update</span>
					</DropdownMenuItem>
					<Separator orientation="horizontal" />
					<DropdownMenuItem
						onClick={() => console.log("Suspend", user.id)}
						className="text-destructive focus:text-destructive"
					>
						<UserX />
						<span>Suspend</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export const CommunitiesMgmtColumns: ColumnDef<Community>[] = [
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
		cell: (role) => titleCase(role.getValue() as string),
		minSize: 80,
	},
	{
		accessorKey: "created_at",
		header: "Created at",
		cell: (info) => formatDate(info.getValue() as string),
		minSize: 160,
	},
	{
		accessorKey: "updated_at",
		header: "Updated at",
		cell: (info) => formatDate(info.getValue() as string),
		minSize: 160,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: (status) => titleCase(status.getValue() as string),
		minSize: 80,
	},
	{
		id: "action",
		cell: ({ row }) => <ActionButton row={row} />,
		minSize: 34,
	},
];
