import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Users, UserCheck, Users2, FileText, Flag, AlertTriangle, ClipboardList, CreditCard, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

// const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

function titleCase(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const PLAN_COLORS: Record<string, string> = {
    basic: "from-blue-500 to-blue-700",
    pro: "from-purple-500 to-purple-700",
    premium: "from-yellow-400 to-orange-500",
};

const PLAN_LIMITS: Record<string, string> = {
    basic: "15,000 users · 100 communities",
    pro: "20,000 users · 200 communities",
    premium: "Unlimited users · Unlimited communities",
};

function InstitutionAdminHomePage() {
    const { user } = useAuth();
    const inst_id = user?.inst_id ?? "";
    const navigate = useNavigate();

    const { data: students } = useQuery({
        queryKey: ["studentUsers", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/students`);
            return res.data;
        },
    });

    const { data: staff } = useQuery({
        queryKey: ["staffUsers", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/staff`);
            return res.data;
        },
    });

    const { data: communities } = useQuery({
        queryKey: ["communities_admin"],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/communities`);
            return res.data;
        },
    });

    const { data: publishedPosts } = useQuery({
        queryKey: ["publishedPosts", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/moderation/published`);
            return res.data;
        },
    });

    const { data: flaggedPosts } = useQuery({
        queryKey: ["flaggedPosts", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/moderation`);
            return res.data;
        },
    });

    const { data: reportedPosts } = useQuery({
        queryKey: ["reportedPosts", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/moderation/reports`);
            return res.data;
        },
    });

    const { data: communityRequests } = useQuery({
        queryKey: ["community_requests"],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/communities/requests`);
            return res.data;
        },
    });

    const { data: institution } = useQuery({
        queryKey: ["currentPlan", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/billing/current-plan`);
            return res.data;
        },
    });

    const currentPlan = institution?.plan?.toLowerCase();
    const planGradient = PLAN_COLORS[currentPlan ?? ""] ?? "from-gray-400 to-gray-600";

    const stats = [
        {
            label: "Students",
            value: students?.length ?? 0,
            icon: <Users size={24} className="text-blue-500" />,
            bg: "bg-blue-50",
            onClick: () => navigate("/admin/users/students"),
        },
        {
            label: "Staff",
            value: staff?.length ?? 0,
            icon: <UserCheck size={24} className="text-green-500" />,
            bg: "bg-green-50",
            onClick: () => navigate("/admin/users/staff"),
        },
        {
            label: "Communities",
            value: communities?.length ?? 0,
            icon: <Users2 size={24} className="text-purple-500" />,
            bg: "bg-purple-50",
            onClick: () => navigate("/admin/communities"),
        },
        {
            label: "Published Posts",
            value: publishedPosts?.length ?? 0,
            icon: <FileText size={24} className="text-orange-500" />,
            bg: "bg-orange-50",
            onClick: () => navigate("/admin/moderation"),
        },
    ];

    const pendingActions = [
        {
            label: "Flagged Posts",
            value: flaggedPosts?.length ?? 0,
            icon: <Flag size={20} className="text-orange-500" />,
            description: "Posts flagged for review",
            urgent: (flaggedPosts?.length ?? 0) > 0,
            onClick: () => navigate("/admin/moderation?tab=flagged"),
        },
        {
            label: "Reported Posts",
            value: reportedPosts?.length ?? 0,
            icon: <AlertTriangle size={20} className="text-red-500" />,
            description: "Posts reported by users",
            urgent: (reportedPosts?.length ?? 0) > 0,
            onClick: () => navigate("/admin/moderation?tab=reported"),
        },
        {
            label: "Community Requests",
            value: communityRequests?.length ?? 0,
            icon: <ClipboardList size={20} className="text-blue-500" />,
            description: "Pending community creation requests",
            urgent: (communityRequests?.length ?? 0) > 0,
            onClick: () => navigate("/admin/communities/requests"),
        },
    ];

    return (
        <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="px-4 py-6 text-2xl font-bold border-b border-muted-foreground">
                Dashboard
            </div>

            <div className="flex flex-col gap-6 px-8 py-4">

                {/* Current Plan Banner — full width */}
                <div
                    className={`bg-gradient-to-r ${planGradient} rounded-xl p-6 cursor-pointer`}
                    onClick={() => navigate("/admin/billing")}
                >
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center gap-2">
                                <CreditCard size={20} className="text-white/80" />
                                <span className="text-white/80 text-sm font-medium">Current Plan</span>
                            </div>
                            <p className="text-white text-4xl font-bold">
                                {currentPlan ? titleCase(currentPlan) : "No Active Plan"}
                            </p>
                            <p className="text-white/80 text-sm">
                                {currentPlan ? PLAN_LIMITS[currentPlan] : "Subscribe to a plan to get started"}
                            </p>
                            <div className="flex flex-row gap-4 mt-1">
                                {institution?.start_date && (
                                    <span className="text-white/70 text-xs">
                                        Started: {new Date(institution.start_date).toLocaleDateString()}
                                    </span>
                                )}
                                {institution?.end_date && (
                                    <span className="text-white/70 text-xs">
                                        Renews: {new Date(institution.end_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                institution?.status === "Active"
                                    ? "bg-white/20 text-white"
                                    : "bg-red-200 text-red-800"
                            }`}>
                                {institution?.status ?? "No Plan"}
                            </span>
                            <Button
                                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 flex flex-row items-center gap-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/admin/billing");
                                }}
                            >
                                {currentPlan ? "Manage Plan" : "Subscribe"}
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Overview</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="flex flex-col gap-3 p-5 rounded-lg border border-border bg-card cursor-pointer hover:shadow-md transition-shadow"
                                onClick={stat.onClick}
                            >
                                <div className={`p-2 rounded-md w-fit ${stat.bg}`}>
                                    {stat.icon}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Actions */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Pending Actions</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {pendingActions.map((action) => (
                            <div
                                key={action.label}
                                className={`flex flex-row justify-between items-center p-5 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                                    action.urgent
                                        ? "border-destructive/40 bg-destructive/5"
                                        : "border-border bg-card"
                                }`}
                                onClick={action.onClick}
                            >
                                <div className="flex flex-col gap-1">
                                    <p className="font-semibold">{action.label}</p>
                                    <p className="text-sm text-muted-foreground">{action.description}</p>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    {action.icon}
                                    <span className={`text-2xl font-bold ${
                                        action.urgent ? "text-destructive" : "text-muted-foreground"
                                    }`}>
                                        {action.value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InstitutionAdminHomePage;