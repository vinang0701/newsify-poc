import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export interface CommunityRequest {
	id: string;
	community_name: string;
	image_url: string;
	requested_by_user_name: string;
	description: string;
	status: string;
	created_at: string;
}

const CommunityRequestCard = (community: CommunityRequest) => {
	return (
		<div className="min-w-fit max-w-69 flex flex-col items-center gap-3 p-4 bg-card shadow-md rounded-md">
			<div className="flex justify-between">
				<div className="font-semibold">{community.community_name}</div>

				<div className="text-xs">#123</div>
			</div>
			<Separator />
			<div>
				{community.image_url !== "" || community.image_url ? (
					<img
						src="community.image_url"
						alt={community.community_name + "image"}
						className="size-[114]"
					/>
				) : (
					<div className="size-28.5 bg-muted-foreground/20 rounded-full" />
				)}
				<p>{community.requested_by_user_name}</p>
			</div>
			<Separator />
			<div>
				<p>Date of creation:</p>
				<p>{community.created_at}</p>
			</div>
			<div className="px-3 py-2 bg-muted-foreground/30 rounded-md min-h-29 wrap-break-word">
				<p className="text-sm">{community.description}</p>
			</div>
			<div>
				<Button className="flex self-end w-22.5 text-xs py-2 rounded-sm">
					Approve
				</Button>
				<Button className="flex self-end w-22.5 text-xs py-2 rounded-sm">
					Reject
				</Button>
			</div>
		</div>
	);
};

export default CommunityRequestCard;
