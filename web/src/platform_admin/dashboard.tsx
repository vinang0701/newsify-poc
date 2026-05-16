import { type CSSProperties } from "react";
import { useNavigate } from "react-router";

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, CSSProperties> = {
    page: {
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "#F4F6FA",
        minHeight: "100vh",
    },
    header: {
        fontSize: 22,
        fontWeight: 700,
        color: "#111827",
    },
    banner: {
        background: "#2563EB",
        borderRadius: 14,
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        color: "#fff",
    },
    bannerTitle: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
    bannerSub: { fontSize: 13, opacity: 0.85 },
    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
    },
    statCard: {
        background: "#fff",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #E8ECF2",
    },
    statLabel: { fontSize: 13, color: "#6B7280" },
    statValue: { fontSize: 22, fontWeight: 700, color: "#111827" },
    mgmtCard: {
        background: "#fff",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #E8ECF2",
    },
    mgmtTitle: {
        fontSize: 16,
        fontWeight: 600,
        color: "#111827",
        marginBottom: 4,
    },
    mgmtSub: { fontSize: 13, color: "#6B7280" },
    btn: {
        background: "#2563EB",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "9px 18px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
    },
};

// ── Component ─────────────────────────────────────────────────────────────────
const PlatformAdminDashboardPage = () => {
    const navigate = useNavigate();

    return (
        <div style={s.page}>
            <div style={s.header}>Dashboard</div>

            {/* Welcome Banner */}
            <div style={s.banner}>
                <img
                    src="/icon_light.png"
                    alt="logo"
                    width={48}
                    style={{ objectFit: "contain" }}
                />
                <div>
                    <div style={s.bannerTitle}>Welcome, Platform Admin!</div>
                    <div style={s.bannerSub}>
                        Manage the platform's user accounts and subscriptions.
                    </div>
                </div>
            </div>

            {/* Management Cards */}
            {[
                {
                    title: "Institution Account Management",
                    sub: "View, create, update, and suspend institution accounts here",
                    btn: "View All Institutions",
                    path: "/platform/institutions",
                },
            ].map((c) => (
                <div key={c.title} style={s.mgmtCard}>
                    <div>
                        <div style={s.mgmtTitle}>{c.title}</div>
                        <div style={s.mgmtSub}>{c.sub}</div>
                    </div>
                    <button style={s.btn} onClick={() => navigate(c.path)}>
                        {c.btn}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default PlatformAdminDashboardPage;
