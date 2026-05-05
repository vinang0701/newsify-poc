import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Users, UserCheck, Users2, FileText, Flag, AlertTriangle, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router";

const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

function InstitutionAdminHomePage() {
    const navigate = useNavigate();

    // Fetch students
    const { data: students } = useQuery({
        queryKey: ["studentUsers", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/students`);
            return res.data;
        },
    });

    // Fetch staff
    const { data: staff } = useQuery({
        queryKey: ["staffUsers", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/staff`);
            return res.data;
        },
    });

    // Fetch communities
    const { data: communities } = useQuery({
        queryKey: ["communities_admin"],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/communities`);
            return res.data;
        },
    });

    // Fetch published posts
    const { data: publishedPosts } = useQuery({
        queryKey: ["publishedPosts", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/moderation/published`);
            return res.data;
        },
    });

    // Fetch flagged posts
    const { data: flaggedPosts } = useQuery({
        queryKey: ["flaggedPosts", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/moderation`);
            return res.data;
        },
    });

    // Fetch reported posts
    const { data: reportedPosts } = useQuery({
        queryKey: ["reportedPosts", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/users/moderation/reports`);
            return res.data;
        },
    });

    // Fetch community creation requests
    const { data: communityRequests } = useQuery({
        queryKey: ["community_requests"],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/communities/requests`);
            return res.data;
        },
    });

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
            onClick: () => navigate("/admin/moderation?tab=published"),
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
        <div>
            <div className="flex flex-col gap-6 px-4">
                {/* Header */}
                <div className="px-4 py-6 text-2xl font-bold border-b border-muted-foreground">
                    Dashboard
                </div>

                <section className="flex flex-col gap-6 px-4">
                    {/* Banner */}
                    <div className="bg-primary flex px-8 py-7 gap-8 rounded-lg">
                        <img
                            src="icon_light.png"
                            height={20}
                            width={102}
                            className="object-contain"
                        />
                        <div className="flex flex-col gap-2">
                            <div className="text-button-text text-5xl font-600">
                                Welcome, Institution Admin!
                            </div>
                            <div className="text-button-text">
                                Manage the institution's user accounts and content.
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Overview</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className={`flex flex-col gap-3 p-5 rounded-lg border border-border bg-card cursor-pointer hover:shadow-md transition-shadow`}
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
                                        <span className={`text-2xl font-bold ${action.urgent ? "text-destructive" : "text-muted-foreground"}`}>
                                            {action.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default InstitutionAdminHomePage;