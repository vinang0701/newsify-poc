import CommunityRequestCard from "@/components/community-request-card";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
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
                    {error && (
                        <p className="text-destructive">{error.message}</p>
                    )}
                    {data && data.length > 0 ? (
                        <div className="max-w-350 mx-auto w-full">
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] justify-between gap-4">
                                {data.map((request) => (
                                    <CommunityRequestCard
                                        key={request.request_id}
                                        data={request}
                                    />
                                ))}
                            </div>
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
