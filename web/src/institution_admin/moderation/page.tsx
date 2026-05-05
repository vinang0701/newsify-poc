import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Flag } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/loading";

const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

interface Post {
    id: string;
    title: string;
    description: string;
    image_url: string;
    status: string;
    created_at: string;
    author: string;
    users: { name: string; email: string };
}

const ContentModerationPage = () => {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    // For approve/reject confirmation
    const [confirmAction, setConfirmAction] = useState<{
        type: "approve" | "reject";
        postId: string;
        postTitle: string;
    } | null>(null);

    // For flag confirmation — includes reason input
    const [flagAction, setFlagAction] = useState<{
        postId: string;
        postTitle: string;
    } | null>(null);
    const [flagReason, setFlagReason] = useState("");

    // Stores the search query typed by the admin
    const [searchEmail, setSearchEmail] = useState("");


    // Fetch flagged posts
    const { data: flaggedPosts, isLoading: loadingFlagged } = useQuery<Post[]>({
        queryKey: ["flaggedPosts", inst_id],
        queryFn: async () => {
            const response = await api.get(`/${inst_id}/admin/users/moderation`);
            return response.data;
        },
    });

    // Fetch published posts
    const { data: publishedPosts, isLoading: loadingPublished } = useQuery<Post[]>({
        queryKey: ["publishedPosts", inst_id],
        queryFn: async () => {
            const response = await api.get(
                `/${inst_id}/admin/users/moderation/published`
            );
            return response.data;
        },
    });

    // Handle approve or reject
    const handleConfirm = async () => {
        if (!confirmAction) return;
        setLoading(true);
        try {
            await api.patch(
                `/${inst_id}/admin/users/moderation/${confirmAction.postId}/${confirmAction.type}`
            );
            queryClient.invalidateQueries({ queryKey: ["flaggedPosts"] });
            queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
            setConfirmAction(null);
        } catch (err) {
            console.error("Action failed:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle flag with reason
    const handleFlag = async () => {
        if (!flagAction || !flagReason.trim()) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("reason", flagReason);

            await api.patch(
                `/${inst_id}/admin/users/moderation/${flagAction.postId}/flag`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            // Refetch both lists — post moves from published to flagged
            queryClient.invalidateQueries({ queryKey: ["flaggedPosts"] });
            queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
            setFlagAction(null);
            setFlagReason("");
        } catch (err) {
            console.error("Flag failed:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loadingFlagged || loadingPublished) return <Loading />;

    // Filter published posts by email — runs every time searchEmail or publishedPosts changes
    const filteredPublishedPosts = publishedPosts?.filter((post) =>
        searchEmail.trim() === ""
            ? true  // if search is empty, show all posts
            : post.users?.email?.toLowerCase().includes(searchEmail.toLowerCase())
    );

    return (
        <div>
            {/* Approve/Reject Confirmation Dialog */}
            {confirmAction && (
                <Dialog
                    open={!!confirmAction}
                    onOpenChange={() => setConfirmAction(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {confirmAction.type === "approve"
                                    ? "Approve Post"
                                    : "Reject Post"}
                            </DialogTitle>
                            <DialogDescription>
                                {confirmAction.type === "approve"
                                    ? `Are you sure you want to approve "${confirmAction.postTitle}"? It will be published immediately.`
                                    : `Are you sure you want to reject "${confirmAction.postTitle}"? It will not be published.`}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                className={
                                    confirmAction.type === "approve"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-destructive hover:bg-destructive/80 text-white"
                                }
                                onClick={handleConfirm}
                                disabled={loading}
                            >
                                {loading
                                    ? "Processing..."
                                    : confirmAction.type === "approve"
                                    ? "Approve"
                                    : "Reject"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Flag with Reason Dialog */}
            {flagAction && (
                <Dialog
                    open={!!flagAction}
                    onOpenChange={() => {
                        setFlagAction(null);
                        setFlagReason("");
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Flag Post</DialogTitle>
                            <DialogDescription>
                                You are flagging "{flagAction.postTitle}". The
                                post will be removed from the feed and the
                                author will be notified with your reason.
                            </DialogDescription>
                        </DialogHeader>
                        {/* Reason input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Reason{" "}
                                <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                placeholder="Enter reason for flagging this post..."
                                value={flagReason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFlagReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => setFlagReason("")}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={handleFlag}
                                disabled={loading || !flagReason.trim()}
                            >
                                {loading ? "Flagging..." : "Flag Post"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="px-4 py-6 text-2xl font-bold border-b border-border">
                    Content Moderation
                </div>

                <section className="flex flex-col py-3 px-4 gap-8">

                    {/* ── SECTION 1 — Flagged Posts ── */}
                    <div className="flex flex-col gap-4">
                        <div className="font-bold text-xl">
                            Flagged Posts ({flaggedPosts?.length ?? 0})
                        </div>
                        {flaggedPosts?.length === 0 ? (
                            <div className="flex justify-center items-center py-10 text-muted-foreground border border-dashed rounded-lg">
                                No flagged posts to review.
                            </div>
                        ) : (
                            flaggedPosts?.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card"
                                >
                                    <div className="flex flex-row justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <p className="font-semibold text-lg">
                                                {post.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                By {post.users?.name} ({post.users?.email}) •{" "}
                                                {new Date(
                                                    post.created_at
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() =>
                                                    setConfirmAction({
                                                        type: "approve",
                                                        postId: post.id,
                                                        postTitle: post.title,
                                                    })
                                                }
                                            >
                                                <Check size={16} />
                                                Approve
                                            </Button>
                                            <Button
                                                className="bg-destructive hover:bg-destructive/80 text-white"
                                                onClick={() =>
                                                    setConfirmAction({
                                                        type: "reject",
                                                        postId: post.id,
                                                        postTitle: post.title,
                                                    })
                                                }
                                            >
                                                <X size={16} />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                    {post.image_url && (
                                        <img
                                            src={post.image_url}
                                            alt={post.title}
                                            className="w-full h-48 object-cover rounded-md"
                                        />
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {post.description}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border" />

                    {/* ── SECTION 2 — Published Posts ── */}
                    <div className="flex flex-col gap-4">
                        <div className="font-bold text-xl">
                            Published Posts ({publishedPosts?.length ?? 0})
                        </div>
                        {publishedPosts?.length === 0 ? (
                            <div className="flex justify-center items-center py-10 text-muted-foreground border border-dashed rounded-lg">
                                No published posts.
                            </div>
                        ) : (

                            <div className="flex flex-col gap-4">
                                {/* Search bar */}
                                <div className="flex flex-row gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Search by author email..."
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        className="border border-border rounded-md px-3 py-2 text-sm w-80 bg-background"
                                    />
                                    {searchEmail && (
                                        <button
                                            onClick={() => setSearchEmail("")}
                                            className="text-sm text-muted-foreground underline"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Posts list */}
                                {filteredPublishedPosts?.length === 0 ? (
                                    <div className="flex justify-center items-center py-10 text-muted-foreground border border-dashed rounded-lg">
                                        No posts found for that email.
                                    </div>
                                ) : (
                                    filteredPublishedPosts?.map((post) => (
                                        <div
                                            key={post.id}
                                            className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card"
                                        >
                                            <div className="flex flex-row justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-semibold text-lg">
                                                        {post.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        By {post.users?.name} ({post.users?.email}) •{" "}
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                                    onClick={() =>
                                                        setFlagAction({
                                                            postId: post.id,
                                                            postTitle: post.title,
                                                        })
                                                    }
                                                >
                                                    <Flag size={16} />
                                                    Flag
                                                </Button>
                                            </div>
                                            {post.image_url && (
                                                <img
                                                    src={post.image_url}
                                                    alt={post.title}
                                                    className="w-full h-48 object-cover rounded-md"
                                                />
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                {post.description}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ContentModerationPage;