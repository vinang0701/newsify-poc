import React from "react";
import { Button } from "../components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

const UsersDashboard = () => {
	return (
		<div className="">
			{/* Right Section */}
			<div className="flex flex-col gap-3">
				{/* Header */}
				<div className="px-4 py-6 text-2xl font-bold border-b border-border">
					User Account Management
				</div>
				<section className="flex flex-col py-3 px-4 gap-6">
					{/* Search and Add */}
					<div className="flex flex-row justify-end gap-4">
						<div className="border border-border rounded-sm">
							<input
								type="text"
								placeholder="Type to search..."
								className="placeholder:text-border pl-2"
							/>
							<Button className="rounded-sm border border-border text-foreground bg-card font-semibold">
								Search
							</Button>
						</div>
						<Button className="rounded-sm font-semibold">
							Add
							<Plus strokeWidth={3} />
						</Button>
					</div>
					{/* Results and Pagination */}
					<div className="flex flex-row justify-between items-center">
						<div className="flex flex-row items-center font-bold text-2xl">
							Results: 0
						</div>
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
					{/* Sort Button */}
					<Button className="flex flex-row items-center gap-1 text-foreground bg-card rounded-sm w-fit">
						Sort
						<ChevronDown />
					</Button>
				</section>
			</div>
		</div>
	);
};

export default UsersDashboard;
