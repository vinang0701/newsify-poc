import type { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit3, MoreVertical, PauseCircle, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface AchievementTable {
    id: string;
    achievement_name: string;
    achievement_detail: string;
    metric_key: string;
    required_count: number;
    badge_url: string | null;
    status: string;
    created_at: string;
}

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
    return text.toLowerCase().replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
}

function formatMetricKey(key: string) {
    return key.replace(/_/g, " ").replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
}

interface ActionButtonProps {
    row: Row<AchievementTable>;
    onEdit: (achievement: AchievementTable) => void;
    onSuspend: (achievement: AchievementTable) => void;
    onActivate: (achievement: AchievementTable) => void;
}

const ActionButton = ({ row, onEdit, onSuspend, onActivate }: ActionButtonProps) => {
    const achievement = row.original;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit cursor-pointer">
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical size={8} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onEdit(achievement)}>
                        <Edit3 />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <Separator orientation="horizontal" />
                    {achievement.status !== "inactive" ? (
                        <DropdownMenuItem
                            onClick={() => onSuspend(achievement)}
                            className="text-destructive focus:text-destructive"
                        >
                            <PauseCircle />
                            <span>Suspend</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => onActivate(achievement)}>
                            <CheckCircle />
                            <span>Activate</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const getAchievementsColumns = (
    onEdit: (achievement: AchievementTable) => void,
    onSuspend: (achievement: AchievementTable) => void,
    onActivate: (achievement: AchievementTable) => void,
): ColumnDef<AchievementTable>[] => [
    {
        accessorKey: "badge_url",
        header: "Badge",
        cell: ({ row }) => (
            row.original.badge_url ? (
                <img
                    src={row.original.badge_url}
                    alt="badge"
                    style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 6 }}
                />
            ) : (
                <span style={{ color: "#9CA3AF", fontSize: 12 }}>No badge</span>
            )
        ),
        minSize: 70,
    },

    {
        accessorKey: "achievement_name",
        header: "Achievement",
        minSize: 200,
    },
    {
        accessorKey: "achievement_detail",
        header: "Description",
        minSize: 250,
    },
    {
        accessorKey: "metric_key",
        header: "Criteria",
        cell: (info) => formatMetricKey(info?.getValue() as string),
        minSize: 160,
    },
    {
        accessorKey: "required_count",
        header: "Required Count",
        minSize: 120,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <span className={row.original.status === "inactive" ? "text-destructive font-medium" : "text-green-600 font-medium"}>
                {titleCase(row.original.status)}
            </span>
        ),
        minSize: 80,
    },
    {
        accessorKey: "created_at",
        header: "Date Added",
        cell: (info) => formatDate(info?.getValue() as string),
        minSize: 160,
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
