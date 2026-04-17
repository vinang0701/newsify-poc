import type { Community } from "@/types";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Camera, Image, ImageOff } from "lucide-react";

interface CommunityCardProps {
	data: Community;
}

const CommunityCard = ({ data }: CommunityCardProps) => {
	return (
		<div className="flex flex-col min-w-69 w-full items-center gap-3 p-4 bg-card shadow-md rounded-md">
			{data.image_url !== "" && data.image_url ? (
				<img
					src={data!.image_url!}
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
				<div className="text-xs">72k members</div>
			</div>
			<div className="w-full px-3 py-2 bg-muted-foreground/30 rounded-md h-29 wrap-break-word overflow-scroll">
				<p className="text-sm">{data.description}</p>
			</div>
			<Button className="flex self-end w-22.5 text-xs py-2 rounded-sm">
				View
			</Button>
		</div>
	);
};

export default CommunityCard;
