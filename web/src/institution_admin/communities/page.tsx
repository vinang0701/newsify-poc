import { useAuth } from "@/components/auth-provider";
import CommunityCard from "@/components/community-card";
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
import api from "@/lib/axios";
import type { Community } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const CommunitiesMgmtPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    if (!user || user === null) {
        console.log("You are not authorized to access this portal!");
    }

    // Data fetching function
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

    // Tanstack Query Data Fetching
    const { data, error } = useQuery<Community[]>({
        queryKey: ["communities_admin"],
        queryFn: fetchCommunities,
    });

    return (
        <div>
            {isLoading && <Loading />}
            {/* Right Section */}
            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="px-4 py-6 text-2xl font-bold border-b border-border">
                    Communities
                </div>
                <section className="flex flex-col py-3 px-4 gap-6">
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
                    {data && data.length > 0 ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] justify-between gap-4">
                            {data.map((community) => (
                                <CommunityCard
                                    key={community.id}
                                    data={community}
                                />
                            ))}
                        </div>
                    ) : (
                        <div>No communities created yet.</div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CommunitiesMgmtPage;
