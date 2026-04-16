import type { Community } from "@/types";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

interface CommunityCardProps {
	community: Community;
}

const CommunityCard = ({ community }: CommunityCardProps) => {
	return (
		<div className="min-w-fit max-w-69 flex flex-col items-center gap-3 p-4 bg-card shadow-md rounded-md">
			{community.image_url !== "" || community.image_url ? (
				<img
					src="community.image_url"
					alt={community.name + "image"}
					className="size-[114]"
				/>
			) : (
				<div className="size-28.5 bg-muted-foreground/20 rounded-full" />
			)}
			<Separator />
			<div className="flex flex-col items-center gap-1">
				<div className="font-semibold">{community.name}</div>
				<Separator className="max-w-15" />
				<div className="text-xs">72k members</div>
			</div>
			<div className="px-3 py-2 bg-muted-foreground/30 rounded-md min-h-29 wrap-break-word">
				<p className="text-sm">{community.description}</p>
			</div>
			<Button className="flex self-end w-22.5 text-xs py-2 rounded-sm">
				View
			</Button>
		</div>
	);
};

export default CommunityCard;
