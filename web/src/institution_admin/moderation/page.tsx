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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router";
import { useAuth } from "@/components/auth-provider";

//const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

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

interface Report {
    report_id: string;
    reason: string;
    description: string;
    status: string;
    created_at: string;
    post_id: string;
    news_posts: {
        id: string;
        title: string;
        description: string;
        image_url: string;
        users: { name: string; email: string };
    };
    users: { name: string; email: string };
}

const ContentModerationPage = () => {
    const { user } = useAuth();
    const inst_id = user?.inst_id ?? "";
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const [confirmAction, setConfirmAction] = useState<{
        type: "approve" | "reject";
        postId: string;
        postTitle: string;
    } | null>(null);

    const [flagAction, setFlagAction] = useState<{
        postId: string;
        postTitle: string;
    } | null>(null);
    const [flagReason, setFlagReason] = useState("");

    const [searchEmail, setSearchEmail] = useState("");

    const [reportAction, setReportAction] = useState<{
        type: "dismiss" | "flag";
        reportId: string;
        postId: string;
        postTitle: string;
    } | null>(null);
    const [reportReason, setReportReason] = useState("");

    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [selectedReportPost, setSelectedReportPost] = useState<Report | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") ?? "reported";

    const { data: flaggedPosts, isLoading: loadingFlagged } = useQuery<Post[]>({
        queryKey: ["flaggedPosts", inst_id],
        queryFn: async () => {
            const response = await api.get(`/${inst_id}/admin/users/moderation`);
            return response.data;
        },
    });

    const { data: publishedPosts, isLoading: loadingPublished } = useQuery<Post[]>({
        queryKey: ["publishedPosts", inst_id],
        queryFn: async () => {
            const response = await api.get(`/${inst_id}/admin/users/moderation/published`);
            return response.data;
        },
    });

    const { data: reportedPosts, isLoading: loadingReports } = useQuery<Report[]>({
        queryKey: ["reportedPosts", inst_id],
        queryFn: async () => {
            const response = await api.get(`/${inst_id}/admin/users/moderation/reports`);
            return response.data;
        },
    });

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

    const handleFlag = async () => {
        if (!flagAction || !flagReason.trim()) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("reason", flagReason);
            await api.patch(
                `/${inst_id}/admin/users/moderation/${flagAction.postId}/flag`,
                formData,
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );
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

    const handleReportAction = async () => {
        if (!reportAction || !reportReason.trim()) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("reason", reportReason);
            if (reportAction.type === "flag") {
                await api.patch(
                    `/${inst_id}/admin/users/moderation/reports/${reportAction.reportId}/flag?post_id=${reportAction.postId}`,
                    formData,
                    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
                );
            } else {
                await api.patch(
                    `/${inst_id}/admin/users/moderation/reports/${reportAction.reportId}/dismiss`,
                    formData,
                    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
                );
            }
            queryClient.invalidateQueries({ queryKey: ["reportedPosts"] });
            queryClient.invalidateQueries({ queryKey: ["flaggedPosts"] });
            queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
            setReportAction(null);
            setReportReason("");
        } catch (err) {
            console.error("Report action failed:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loadingFlagged || loadingPublished || loadingReports) return <Loading />;

    const filteredPublishedPosts = publishedPosts?.filter((post) =>
        searchEmail.trim() === ""
            ? true
            : post.users?.email?.toLowerCase().includes(searchEmail.toLowerCase())
    );

    return (
        <div>
            {/* Approve/Reject Dialog */}
            {confirmAction && (
                <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {confirmAction.type === "approve" ? "Approve Post" : "Reject Post"}
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
                                {loading ? "Processing..." : confirmAction.type === "approve" ? "Approve" : "Reject"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Flag Dialog */}
            {flagAction && (
                <Dialog open={!!flagAction} onOpenChange={() => { setFlagAction(null); setFlagReason(""); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Flag Post</DialogTitle>
                            <DialogDescription>
                                You are flagging "{flagAction.postTitle}". The post will be removed from the feed and the author will be notified.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Reason <span className="text-destructive">*</span>
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
                                <Button variant="outline" onClick={() => setFlagReason("")}>Cancel</Button>
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

            {/* Report Action Dialog */}
            {reportAction && (
                <Dialog open={!!reportAction} onOpenChange={() => { setReportAction(null); setReportReason(""); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {reportAction.type === "dismiss" ? "Dismiss Report" : "Flag Post"}
                            </DialogTitle>
                            <DialogDescription>
                                {reportAction.type === "dismiss"
                                    ? `You are dismissing the report for "${reportAction.postTitle}". The post will remain published.`
                                    : `You are flagging "${reportAction.postTitle}" based on this report. The post will be removed and the author notified.`}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Reason <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                placeholder="Enter reason..."
                                value={reportReason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReportReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" onClick={() => setReportReason("")}>Cancel</Button>
                            </DialogClose>
                            <Button
                                className={
                                    reportAction.type === "dismiss"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-destructive hover:bg-destructive/80 text-white"
                                }
                                onClick={handleReportAction}
                                disabled={loading || !reportReason.trim()}
                            >
                                {loading ? "Processing..." : reportAction.type === "dismiss" ? "Dismiss Report" : "Flag Post"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Post Detail Dialog */}
            {selectedPost && (
                <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">{selectedPost.title}</DialogTitle>
                            <DialogDescription>
                                By {selectedPost.users?.name} ({selectedPost.users?.email}) •{" "}
                                {new Date(selectedPost.created_at).toLocaleDateString()}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedPost.image_url && (
                            <img
                                src={selectedPost.image_url}
                                alt={selectedPost.title}
                                className="w-full rounded-md object-cover"
                            />
                        )}
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                            {selectedPost.description}
                        </p>
                    </DialogContent>
                </Dialog>
            )}

            {/* Report Post Detail Dialog */}
            {selectedReportPost && (
                <Dialog open={!!selectedReportPost} onOpenChange={() => setSelectedReportPost(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">{selectedReportPost.news_posts?.title}</DialogTitle>
                            <DialogDescription>
                                By {selectedReportPost.news_posts?.users?.name} ({selectedReportPost.news_posts?.users?.email})
                            </DialogDescription>
                        </DialogHeader>
                        {selectedReportPost.news_posts?.image_url && (
                            <img
                                src={selectedReportPost.news_posts.image_url}
                                alt={selectedReportPost.news_posts.title}
                                className="w-full rounded-md object-cover"
                            />
                        )}
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                            {selectedReportPost.news_posts?.description}
                        </p>
                    </DialogContent>
                </Dialog>
            )}

            <div className="flex flex-col gap-3">
                <div className="px-4 py-6 text-2xl font-bold border-b border-border">
                    Content Moderation
                </div>

                <section className="flex flex-col py-3 px-4 gap-4">
                    <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="reported">
                                Reported ({reportedPosts?.length ?? 0})
                            </TabsTrigger>
                            <TabsTrigger value="flagged">
                                Flagged ({flaggedPosts?.length ?? 0})
                            </TabsTrigger>
                            <TabsTrigger value="published">
                                Published ({publishedPosts?.length ?? 0})
                            </TabsTrigger>
                        </TabsList>

                        {/* ── TAB 1 — Reported Posts ── */}
                        <TabsContent value="reported">
                            <div className="flex flex-col gap-4">
                                {reportedPosts?.length === 0 ? (
                                    <div className="flex justify-center items-center py-10 text-muted-foreground border border-dashed rounded-lg">
                                        No reported posts to review.
                                    </div>
                                ) : (
                                    reportedPosts?.map((report) => (
                                        <div
                                            key={report.report_id}
                                            className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card cursor-pointer hover:border-primary transition-colors"
                                            onClick={() => setSelectedReportPost(report)}
                                        >
                                            <div className="flex flex-row justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-semibold text-lg">{report.news_posts?.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Author: {report.news_posts?.users?.name} ({report.news_posts?.users?.email})
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Reported by: {report.users?.name} ({report.users?.email})
                                                    </p>
                                                    <p className="text-sm font-medium mt-1">
                                                        Reason: {report.reason}
                                                    </p>
                                                    {report.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Details: {report.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        Reported on {new Date(report.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex flex-row gap-2">
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setReportAction({ type: "dismiss", reportId: report.report_id, postId: report.post_id, postTitle: report.news_posts?.title });
                                                        }}
                                                    >
                                                        <Check size={16} />
                                                        Dismiss
                                                    </Button>
                                                    <Button
                                                        className="bg-destructive hover:bg-destructive/80 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setReportAction({ type: "flag", reportId: report.report_id, postId: report.post_id, postTitle: report.news_posts?.title });
                                                        }}
                                                    >
                                                        <Flag size={16} />
                                                        Flag Post
                                                    </Button>
                                                </div>
                                            </div>
                                            {report.news_posts?.image_url && (
                                                <img src={report.news_posts.image_url} alt={report.news_posts.title} className="w-full h-48 object-cover rounded-md" />
                                            )}
                                            {report.news_posts?.description && (
                                                <p className="text-sm text-muted-foreground">{report.news_posts.description}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* ── TAB 2 — Flagged Posts ── */}
                        <TabsContent value="flagged">
                            <div className="flex flex-col gap-4">
                                {flaggedPosts?.length === 0 ? (
                                    <div className="flex justify-center items-center py-10 text-muted-foreground border border-dashed rounded-lg">
                                        No flagged posts to review.
                                    </div>
                                ) : (
                                    flaggedPosts?.map((post) => (
                                        <div
                                            key={post.id}
                                            className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card cursor-pointer hover:border-primary transition-colors"
                                            onClick={() => setSelectedPost(post)}
                                        >
                                            <div className="flex flex-row justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-semibold text-lg">{post.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        By {post.users?.name} ({post.users?.email}) •{" "}
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex flex-row gap-2">
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmAction({ type: "approve", postId: post.id, postTitle: post.title });
                                                        }}
                                                    >
                                                        <Check size={16} />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        className="bg-destructive hover:bg-destructive/80 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmAction({ type: "reject", postId: post.id, postTitle: post.title });
                                                        }}
                                                    >
                                                        <X size={16} />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                            {post.image_url && (
                                                <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover rounded-md" />
                                            )}
                                            <p className="text-sm text-muted-foreground">{post.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* ── TAB 3 — Published Posts ── */}
                        <TabsContent value="published">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-row gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Search by author email..."
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        className="border border-border rounded-md px-3 py-2 text-sm w-80 bg-background"
                                    />
                                    {searchEmail && (
                                        <button onClick={() => setSearchEmail("")} className="text-sm text-muted-foreground underline">
                                            Clear
                                        </button>
                                    )}
                                </div>
                                {filteredPublishedPosts?.length === 0 ? (
                                    <div className="flex justify-center items-center py-10 text-muted-foreground border border-dashed rounded-lg">
                                        No posts found for that email.
                                    </div>
                                ) : (
                                    filteredPublishedPosts?.map((post) => (
                                        <div
                                            key={post.id}
                                            className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card cursor-pointer hover:border-primary transition-colors"
                                            onClick={() => setSelectedPost(post)}
                                        >
                                            <div className="flex flex-row justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-semibold text-lg">{post.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        By {post.users?.name} ({post.users?.email}) •{" "}
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFlagAction({ postId: post.id, postTitle: post.title });
                                                    }}
                                                >
                                                    <Flag size={16} />
                                                    Flag
                                                </Button>
                                            </div>
                                            {post.image_url && (
                                                <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover rounded-md" />
                                            )}
                                            <p className="text-sm text-muted-foreground">{post.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>
            </div>
        </div>
    );
};

export default ContentModerationPage;