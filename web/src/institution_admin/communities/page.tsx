import { useAuth } from "@/components/auth-provider";
import CommunityCard from "@/components/community-card";
import Loading from "@/components/loading";
import api from "@/lib/axios";
import type { Community } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

const CommunitiesMgmtPage = () => {
	const { user } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");

	if (!user || user === null) {
		console.log("You are not authorized to access this portal!");
	}

	async function fetchCommunities(): Promise<Community[]> {
		try {
			const response = await api.get(
				`${user?.inst_id}/admin/communities`,
			);
			return response.data;
		} catch (e) {
			throw e;
		}
	}

	const { data, isLoading } = useQuery<Community[]>({
		queryKey: ["communities_admin"],
		queryFn: fetchCommunities,
	});

	// Filter communities by name
	const filteredCommunities = data?.filter((community) =>
		searchQuery.trim() === ""
			? true
			: community.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="min-h-screen">
			{isLoading && <Loading />}
			<div className="flex flex-col gap-3">
				{/* Header */}
				<div className="px-4 md:px-6 py-6 text-2xl md:text-2xl font-bold border-b border-border">
					Communities
				</div>
				<section className="flex flex-col py-3 px-4 md:px-6 gap-6">
					{/* Search bar */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
						<div className="text-sm text-muted-foreground">
							Results: {filteredCommunities?.length ?? 0}
						</div>
						<ButtonGroup className="flex flex-row">
							<Input
								type="text"
								placeholder="Search by community name..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="placeholder:text-border pl-2 border-border rounded-sm w-full sm:w-64 md:w-72"
							/>
							{searchQuery && (
								<Button
									className="rounded-sm border border-border text-foreground bg-card hover:bg-card/40 font-semibold"
									onClick={() => setSearchQuery("")}
								>
									Clear
								</Button>
							)}
						</ButtonGroup>
					</div>

					{filteredCommunities && filteredCommunities.length > 0 ? (
						<div className="max-w-350 mx-auto w-full">
							<div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] justify-between gap-4">
								{filteredCommunities.map((community) => (
									<CommunityCard
										key={community.id}
										data={community}
									/>
								))}
							</div>
						</div>
					) : (
						<div className="flex justify-center items-center py-20 text-muted-foreground">
							{searchQuery
								? `No communities found for "${searchQuery}"`
								: "No communities created yet."}
						</div>
					)}
				</section>
			</div>
		</div>
	);
};

export default CommunitiesMgmtPage;
