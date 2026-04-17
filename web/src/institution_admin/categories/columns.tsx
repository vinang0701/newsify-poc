import type { ColumnDef, Row, RowData } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit3, MoreVertical, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { CategoryTable } from "@/types";

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
	row: Row<CategoryTable>;
}

function titleCase(text: string) {
	return text.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
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
						onClick={() => console.log("Edit", user.id)}
					>
						<Edit3 />
						<span>Edit</span>
					</DropdownMenuItem>
					<Separator orientation="horizontal" />
					<DropdownMenuItem
						onClick={() => console.log("Suspend", user.id)}
						className="text-destructive focus:text-destructive"
					>
						<Trash2 />
						<span>Suspend</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export const CategoriesColumns: ColumnDef<CategoryTable>[] = [
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
		cell: ({ row }) => titleCase(row.original.status),
		minSize: 80,
	},
	{
		id: "action",
		cell: ({ row }) => <ActionButton row={row} />,
		minSize: 34,
	},
];
