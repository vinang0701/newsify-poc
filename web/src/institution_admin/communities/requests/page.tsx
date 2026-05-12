import CommunityRequestCard from "@/components/community-request-card";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
} from "@/components/ui/pagination";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/axios";
import type { CommunityCreationRequest } from "@/types";
import { useQuery } from "@tanstack/react-query";

const RequestsMgmtPage = () => {
	const { user } = useAuth();

	if (!user || user === null) {
		console.log("You are not authorized to access this portal!");
		return;
	}

	// Data fetching function
	async function fetchCommunityCreationRequests(): Promise<
		CommunityCreationRequest[]
	> {
		try {
			const response = await api.get(
				`${user?.inst_id}/admin/communities/requests`,
			);

			return response.data;
		} catch (e) {
			throw e;
		}
	}

	// Tanstack Query Data Fetching
	const { isFetching, data, error } = useQuery<CommunityCreationRequest[]>({
		queryKey: ["community_requests", user.inst_id],
		queryFn: fetchCommunityCreationRequests,
	});

	return (
		<div className="h-full">
			{isFetching && <Loading />}
			{/* Right Section */}
			<div className="flex flex-col h-full gap-3">
				{/* Header */}
				<div className="px-4 py-6 text-2xl font-bold border-b border-border">
					Communities
				</div>
				<section className="flex flex-col h-full py-3 px-4 gap-6">
					{/* Search and Add */}
					<div className="flex flex-row justify-end gap-4">
						<ButtonGroup className="flex flex-row">
							<Input
								type="text"
								placeholder="Type to search..."
								className="placeholder:text-border pl-2 border-border rounded-sm"
							/>
							<Button className="rounded-sm border border-border text-foreground bg-card hover:bg-card/40 font-semibold">
								Search
							</Button>
						</ButtonGroup>
					</div>
					<div className="flex flex-row justify-between items-center">
						<Button
							variant="outline"
							className="flex flex-row items-center gap-1 text-foreground bg-card hover:bg-card/40 rounded-sm w-fit"
						>
							Sort
							<ChevronDown />
						</Button>
						<Pagination className="">
							<PaginationContent>
								<PaginationItem>
									<PaginationLink href="#">1</PaginationLink>
								</PaginationItem>
								<PaginationItem>
									<PaginationLink href="#" isActive>
										2
									</PaginationLink>
								</PaginationItem>
								<PaginationItem>
									<PaginationLink href="#">3</PaginationLink>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
					{error && (
						<p className="text-destructive">{error.message}</p>
					)}
					{data && data.length > 0 ? (
						<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
							{data.map((request) => (
								<CommunityRequestCard
									key={request.request_id}
									data={request}
								/>
							))}
						</div>
					) : (
						<div className="flex flex-col h-full items-center py-10 gap-1">
							<p className="text-xl font-semibold">
								No pending requests
							</p>
							<p className="text-caption">
								You're all caught up! No pending requests.
							</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
};

export default RequestsMgmtPage;
