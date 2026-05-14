import type { CommunityCreationRequest } from "@/types";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { formatDate } from "@/lib/format_date";
import { ImageIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "./auth-provider";
import Loading from "./loading";
import { Image } from "lucide-react";
import { useState } from "react";
import { Textarea } from "./ui/textarea";

interface CommunityRequestCardProps {
    data: CommunityCreationRequest;
}

interface ResToReqPayload {
    request_id: string;
    response_status: "approved" | "rejected";
    rejection_reason?: string | null;
}

const CommunityRequestCard = ({ data }: CommunityRequestCardProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [rejecting, setRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    if (!user || user === null) {
        console.log("You are not authorized to access this portal!");
        return;
    }
    // Respond to request mutation function
    // Mutation
    const { mutate: respondToRequest, isPending } = useMutation({
        mutationFn: async (payload: ResToReqPayload) => {
            const { data } = await api.patch(
                `/${user.inst_id}/admin/communities/requests`,
                payload,
            );
            return data;
        },
        onSuccess: (data, variables) => {
            const action =
                variables.response_status === "approved"
                    ? "approved"
                    : "rejected";

            console.log(data);
            console.log(action);

            // Invalidate both the requests list and the communities list
            // because a new community might have been created
            queryClient.invalidateQueries({
                queryKey: ["community_requests", user.inst_id],
            });
            queryClient.invalidateQueries({
                queryKey: ["communities", user.inst_id],
            });
        },
        onError: (error: any) => {
            const message =
                error.response?.data?.detail || "Failed to respond to request";
            console.log(message);
        },
    });

    const handleApprove = (request_id: string) => {
        respondToRequest({
            request_id: request_id,
            response_status: "approved",
        });
    };

    const handleReject = () => {
        respondToRequest({
            request_id: data.request_id,
            response_status: "rejected",
            rejection_reason: rejectionReason ?? "",
        });
        setRejecting(false);
        setRejectionReason("");
    };

    return (
        <div className="w-full flex flex-col gap-3 p-4 bg-card shadow-md rounded-md">
            {isPending && <Loading />}
            {data.community_image_url !== "" && data.community_image_url ? (
                <img
                    src={data.community_image_url}
                    alt={`${data.community_name} image`}
                    className="size-28.5 rounded-full self-center justify-self-center flex"
                />
            ) : (
                <div className="size-28.5 bg-muted-foreground/20 rounded-full items-center flex">
                    <Image size={48} />
                </div>
            )}
            <Separator />
            <p className="font-semibold overflow-scroll">
                Name: {data.community_name}
            </p>
            <Separator />
            <div className="flex items-center gap-2">
                {data.requested_by_user_image_url !== "" &&
                data.requested_by_user_image_url ? (
                    <img
                        src={data.requested_by_user_image_url}
                        alt={`${data.community_name} image`}
                        className="size-11 aspect-square object-cover rounded-full"
                    />
                ) : (
                    <div className="size-11 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                        <ImageIcon size={20} />
                    </div>
                )}
                <p className="font-semibold">{data.requested_by_user_name}</p>
            </div>
            <Separator />
            <div className="flex text-sm gap-2">
                <p className="font-semibold">Date of creation:</p>
                <p>{formatDate(data.created_at)}</p>
            </div>
            <div className="px-3 py-2 bg-muted-foreground/30 rounded-md min-h-24 wrap-break-word w-full overflow-scroll">
                <p className="text-sm">{data.description}</p>
            </div>
            {rejecting && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">Rejection reason</p>
                    <Textarea
                        className="w-full pt-2 border border-border rounded-sm p-2 text-sm bg-muted resize-none"
                        rows={3}
                        placeholder="Enter reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </div>
            )}
            <div className="flex justify-end gap-4">
                <Button
                    className="flex self-end w-22.5 text-xs py-2 rounded-sm bg-success hover:bg-success/80"
                    onClick={() => handleApprove(data.request_id)}
                >
                    Approve
                </Button>
                {rejecting ? (
                    <>
                        <Button
                            className="flex self-end w-22.5 text-xs py-2 rounded-sm bg-muted text-foreground hover:bg-muted/80"
                            onClick={() => {
                                setRejecting(false);
                                setRejectionReason("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex self-end w-22.5 text-xs py-2 rounded-sm bg-destructive hover:bg-destructive/80"
                            onClick={handleReject}
                            disabled={!rejectionReason.trim()}
                        >
                            Confirm
                        </Button>
                    </>
                ) : (
                    <Button
                        className="flex self-end w-22.5 text-xs py-2 rounded-sm bg-destructive hover:bg-destructive/80"
                        onClick={() => setRejecting(true)}
                    >
                        Reject
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CommunityRequestCard;
