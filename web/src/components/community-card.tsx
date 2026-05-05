import type { Community } from "@/types";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Image } from "lucide-react";
import { useNavigate } from "react-router";

interface CommunityCardProps {
    data: Community;
}

const CommunityCard = ({ data }: CommunityCardProps) => {
    const navigate = useNavigate();

    // Status badge color
    const statusColor = {
        active: "bg-green-100 text-green-700",
        under_review: "bg-orange-100 text-orange-700",
        disbanded: "bg-red-100 text-red-700",
    }[data.status] ?? "bg-gray-100 text-gray-700";

    return (
        <div className="flex flex-col min-w-69 w-full items-center gap-3 p-4 bg-card shadow-md rounded-md">
            {data.image_url !== "" && data.image_url ? (
                <img
                    src={data.image_url}
                    alt={`${data.name} image`}
                    className="size-[114]"
                />
            ) : (
                <div className="size-28.5 bg-muted-foreground/20 rounded-full items-center justify-center flex">
                    <Image size={48} />
                </div>
            )}
            <Separator />
            <div className="flex flex-col items-center gap-1">
                <div className="font-semibold">{data.name}</div>
                <Separator className="max-w-15" />
                {/* Status badge + Member count  one ontop of the other*/}
				<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
					{data.status.replace("_", " ").toUpperCase()}
				</span>
				<span className="text-xs text-muted-foreground">
					{data.member_count ?? 0} members
				</span>
            </div>
            <div className="w-full px-3 py-2 bg-muted-foreground/30 rounded-md h-29 wrap-break-word overflow-scroll">
                <p className="text-sm">{data.description}</p>
            </div>
            <Button
                className="flex self-end w-22.5 text-xs py-2 rounded-sm"
                onClick={() => navigate(`/admin/communities/${data.id}`)}
            >
                View
            </Button>
        </div>
    );
};

export default CommunityCard;