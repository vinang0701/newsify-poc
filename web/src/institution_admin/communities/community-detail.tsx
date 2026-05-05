import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/components/auth-provider";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { ArrowLeft, Shield, ShieldOff, ShieldAlert, ShieldX } from "lucide-react";
import type { CommunityDetail } from "@/types";

const CommunityDetailPage = () => {
    const { community_id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    // Confirmation dialog state
    const [confirmAction, setConfirmAction] = useState<
    "review" | "reactivate" | "disband" | null
    >(null);

    // Member action state
    const [memberAction, setMemberAction] = useState<{
        type: "promote" | "revoke";
        userId: string;
        userName: string;
    } | null>(null);

    const { data, isLoading } = useQuery<CommunityDetail>({
        queryKey: ["communityDetail", community_id],
        queryFn: async () => {
            const response = await api.get(
                `/${user?.inst_id}/admin/communities/${community_id}/details`
            );
            return response.data;
        },
        enabled: !!community_id && !!user?.inst_id,
    });

    const community = data?.community;
    const members = data?.members ?? [];

    // Handle community status actions
    const handleStatusAction = async () => {
        if (!confirmAction) return;
        setLoading(true);
        try {
            await api.patch(
                `/${user?.inst_id}/admin/communities/${community_id}/${confirmAction}`
            );
            queryClient.invalidateQueries({ queryKey: ["communityDetail", community_id] });
            queryClient.invalidateQueries({ queryKey: ["communities_admin"] });
            setConfirmAction(null);
        } catch (err) {
            console.error("Action failed:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle member role actions
    const handleMemberAction = async () => {
        if (!memberAction) return;
        setLoading(true);
        try {
            await api.patch(
                `/${user?.inst_id}/admin/communities/${community_id}/members/${memberAction.userId}/${memberAction.type}`
            );
            queryClient.invalidateQueries({ queryKey: ["communityDetail", community_id] });
            setMemberAction(null);
        } catch (err) {
            console.error("Member action failed:", err);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) return <Loading />;
    if (!community) return <div className="p-4">Community not found.</div>;

    const isActive = community.status === "active";
    const isUnderReview = community.status === "under_review";
    const isDisbanded = community.status === "disbanded";

    const actionConfig = {
        review: {
            label: "Put Under Review",
            description: `Are you sure you want to put "${community.name}" under review? Members will not be able to post or communicate until reactivated.`,
            buttonClass: "bg-orange-500 hover:bg-orange-600 text-white",
        },
        reactivate: {
            label: "Reactivate Community",
            description: `Are you sure you want to reactivate "${community.name}"? Normal operations will resume.`,
            buttonClass: "bg-green-600 hover:bg-green-700 text-white",
        },
        disband: {
            label: "Disband Community",
            description: `Are you sure you want to disband "${community.name}"? This community will no longer be accessible to members or admins.`,
            buttonClass: "bg-destructive hover:bg-destructive/80 text-white",
        },
    };

    // Status badge
    const statusColor = {
        active: "bg-green-100 text-green-700",
        under_review: "bg-orange-100 text-orange-700",
        disbanded: "bg-red-100 text-red-700",
    }[community.status] ?? "bg-gray-100 text-gray-700";

    return (
        <div className="flex flex-col gap-6">
            {/* Status Action Confirmation Dialog */}
            {confirmAction && (
                <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{actionConfig[confirmAction].label}</DialogTitle>
                            <DialogDescription>
                                {actionConfig[confirmAction].description}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                className={actionConfig[confirmAction].buttonClass}
                                onClick={handleStatusAction}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : actionConfig[confirmAction].label}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Member Action Confirmation Dialog */}
            {memberAction && (
                <Dialog open={!!memberAction} onOpenChange={() => setMemberAction(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {memberAction.type === "promote" ? "Promote to Admin" : "Revoke Admin Rights"}
                            </DialogTitle>
                            <DialogDescription>
                                {memberAction.type === "promote"
                                    ? `Are you sure you want to promote ${memberAction.userName} to community admin?`
                                    : `Are you sure you want to revoke admin rights from ${memberAction.userName}?`}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                className={
                                    memberAction.type === "promote"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-destructive hover:bg-destructive/80 text-white"
                                }
                                onClick={handleMemberAction}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : memberAction.type === "promote" ? "Promote" : "Revoke"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Header */}
            <div className="px-4 py-6 border-b border-border flex flex-row items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="p-2"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div className="text-2xl font-bold">Community Details</div>
            </div>

            <div className="px-4 flex flex-col gap-6">
                {/* Community Info Card */}
                <div className="flex flex-col gap-4 p-6 border border-border rounded-lg bg-card">
                    <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-row gap-4 items-center">
                            {community.image_url ? (
                                <img
                                    src={community.image_url}
                                    alt={community.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                                    <Shield size={24} />
                                </div>
                            )}
                            <div className="flex flex-col gap-1">
                                <p className="text-xl font-bold">{community.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Created by {community.users?.name} ({community.users?.email})
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(community.created_at).toLocaleDateString()}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusColor}`}>
                                    {community.status.replace("_", " ").toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row gap-2">
                            {isActive && (
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={() => setConfirmAction("review")}
                                >
                                    <ShieldAlert size={16} />
                                    Put Under Review
                                </Button>
                            )}
                            {isUnderReview && (
                                <>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => setConfirmAction("reactivate")}
                                    >
                                        <Shield size={16} />
                                        Reactivate
                                    </Button>
                                    <Button
                                        className="bg-destructive hover:bg-destructive/80 text-white"
                                        onClick={() => setConfirmAction("disband")}
                                    >
                                        <ShieldX size={16} />
                                        Disband
                                    </Button>
                                </>
                            )}
                            {isDisbanded && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => setConfirmAction("reactivate")}
                                >
                                    <Shield size={16} />
                                    Reactivate
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="p-3 bg-muted-foreground/10 rounded-md">
                        <p className="text-sm">{community.description}</p>
                    </div>
                </div>

                {/* Members Section */}
                <div className="flex flex-col gap-4">
                    <div className="font-bold text-xl">
                        Members ({members.length})
                    </div>
                    {members.length === 0 ? (
                        <div className="flex justify-center items-center py-10 text-muted-foreground border border-dashed rounded-lg">
                            No members yet.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {members.map((member) => (
                                <div
                                    key={member.user_id}
                                    className="flex flex-row justify-between items-center p-4 border border-border rounded-lg bg-card"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="font-medium">{member.users?.name}</p>
                                        <p className="text-sm text-muted-foreground">{member.users?.email}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${
                                            member.role === "admin"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}>
                                            {member.role.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Member Actions — only show if community is active */}
                                    {isActive && (
                                        <div className="flex flex-row gap-2">
                                            {member.role === "member" ? (
                                                <Button
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                                    onClick={() => setMemberAction({
                                                        type: "promote",
                                                        userId: member.user_id,
                                                        userName: member.users?.name,
                                                    })}
                                                >
                                                    <Shield size={14} />
                                                    Promote to Admin
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="bg-destructive hover:bg-destructive/80 text-white text-xs"
                                                    onClick={() => setMemberAction({
                                                        type: "revoke",
                                                        userId: member.user_id,
                                                        userName: member.users?.name,
                                                    })}
                                                >
                                                    <ShieldOff size={14} />
                                                    Revoke Admin
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityDetailPage;