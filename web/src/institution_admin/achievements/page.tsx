import { useState, useMemo, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";
import { useAuth } from "@/components/auth-provider";
import api from "@/lib/axios";

// ── types ─────────────────────────────────────────────────────────────────────
interface Achievement {
    id: string;
    name: string;
    detail: string;
    criteria: string;
    count: number;
    status: string;
    dateAdded: string;
    badgeUrl: string | null;
}

interface FormData {
    achievement_name: string;
    achievement_detail: string;
    metric_key: string;
    required_count: string;
    badge_url: string;
}

// ── constants ─────────────────────────────────────────────────────────────────
const BADGE_ICONS: Record<string, string> = {
    Idol: "⭐",
    "Mr. Worldwide": "🌐",
    "Eye Candy": "👁️",
    "The Commentator": "💬",
    "The Publisher": "📝",
};

const METRIC_KEYS = [
    { value: "comments_created", label: "Comments Created" },
    { value: "followers", label: "Followers" },
    { value: "posts_liked", label: "Posts Liked" },
    { value: "posts_created", label: "Posts Created" },
    { value: "communities_joined", label: "Communities Joined" },
];

const CRITERIA_STYLES: Record<string, { bg: string; color: string }> = {
    comments_created: { bg: "#E1F5EE", color: "#085041" },
    followers: { bg: "#E6F1FB", color: "#0C447C" },
    posts_liked: { bg: "#FAEEDA", color: "#633806" },
    posts_created: { bg: "#FBEAF0", color: "#72243E" },
    communities_joined: { bg: "#EEEDFE", color: "#3C3489" },
};

const EMPTY_FORM: FormData = {
    achievement_name: "",
    achievement_detail: "",
    metric_key: "",
    required_count: "",
    badge_url: "",
};

// ── field mapping ─────────────────────────────────────────────────────────────
function fromApi(a: any): Achievement {
    return {
        id: a.achievement_id ?? a.id,
        name: a.achievement_name,
        detail: a.achievement_detail ?? "-",
        criteria: a.metric_key,
        count: a.required_count,
        status: a.status ?? "active",
        dateAdded: a.created_at
            ? new Date(a.created_at).toLocaleString("en-GB", {
                  dateStyle: "short",
                  timeStyle: "medium",
              })
            : "—",
        badgeUrl: a.badge_url ?? null,
    };
}

// ── styles ────────────────────────────────────────────────────────────────────
const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
};
const modalStyle: CSSProperties = {
    background: "#fff",
    borderRadius: 14,
    padding: "28px 32px",
    width: 480,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    maxHeight: "90vh",
    overflowY: "auto",
};
const labelStyle: CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 5,
    display: "block",
};
const inputStyle: CSSProperties = {
    width: "100%",
    border: "1px solid #E8ECF2",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    background: "#F9FAFB",
};
const requiredStyle: CSSProperties = { color: "#EF4444" };
const errorTextStyle: CSSProperties = {
    color: "#EF4444",
    fontSize: 11,
    marginTop: 3,
};

// ── sub-components ────────────────────────────────────────────────────────────
function CriteriaPill({ criteria }: { criteria: string }) {
    const style = CRITERIA_STYLES[criteria] || {
        bg: "#F1EFE8",
        color: "#5F5E5A",
    };
    const label =
        METRIC_KEYS.find((m) => m.value === criteria)?.label ?? criteria;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: 12,
                padding: "3px 10px",
                borderRadius: 99,
                background: style.bg,
                color: style.color,
                whiteSpace: "nowrap",
                fontWeight: 500,
            }}
        >
            {label}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isActive = status === "active";
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? "#3B6D11" : "#A32D2D",
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isActive ? "#3B6D11" : "#A32D2D",
                    flexShrink: 0,
                }}
            />
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

function AchievementForm({
    form,
    setForm,
    errors,
}: {
    form: FormData;
    setForm: React.Dispatch<React.SetStateAction<FormData>>;
    errors: Partial<FormData>;
}) {
    return (
        <>
            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                    Achievement Name <span style={requiredStyle}>*</span>
                </label>
                <input
                    style={{
                        ...inputStyle,
                        borderColor: errors.achievement_name
                            ? "#EF4444"
                            : "#E8ECF2",
                    }}
                    value={form.achievement_name}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            achievement_name: e.target.value,
                        }))
                    }
                    placeholder="Enter achievement name"
                />
                {errors.achievement_name && (
                    <div style={errorTextStyle}>{errors.achievement_name}</div>
                )}
            </div>
            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                    Description <span style={requiredStyle}>*</span>
                </label>
                <textarea
                    style={
                        {
                            ...inputStyle,
                            minHeight: 80,
                            resize: "vertical",
                        } as CSSProperties
                    }
                    value={form.achievement_detail}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            achievement_detail: e.target.value,
                        }))
                    }
                    placeholder="Enter achievement description"
                />
                {errors.achievement_detail && (
                    <div style={errorTextStyle}>
                        {errors.achievement_detail}
                    </div>
                )}
            </div>
            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                    Criteria <span style={requiredStyle}>*</span>
                </label>
                <select
                    style={{
                        ...inputStyle,
                        borderColor: errors.metric_key ? "#EF4444" : "#E8ECF2",
                    }}
                    value={form.metric_key}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, metric_key: e.target.value }))
                    }
                >
                    <option value="">Select a criteria</option>
                    {METRIC_KEYS.map((m) => (
                        <option key={m.value} value={m.value}>
                            {m.label}
                        </option>
                    ))}
                </select>
                {errors.metric_key && (
                    <div style={errorTextStyle}>{errors.metric_key}</div>
                )}
            </div>
            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                    Required Count <span style={requiredStyle}>*</span>
                </label>
                <input
                    style={{
                        ...inputStyle,
                        borderColor: errors.required_count
                            ? "#EF4444"
                            : "#E8ECF2",
                    }}
                    type="number"
                    min="1"
                    value={form.required_count}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            required_count: e.target.value,
                        }))
                    }
                    placeholder="Enter required count"
                />
                {errors.required_count && (
                    <div style={errorTextStyle}>{errors.required_count}</div>
                )}
            </div>
            <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Badge URL</label>
                <input
                    style={inputStyle}
                    value={form.badge_url}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, badge_url: e.target.value }))
                    }
                    placeholder="Enter badge image URL (optional)"
                />
            </div>
        </>
    );
}

function RowMenu({
    row,
    onEdit,
    onSuspend,
    onActivate,
}: {
    row: Achievement;
    onEdit: () => void;
    onSuspend: () => void;
    onActivate: () => void;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    color: "#aaa",
                    padding: "2px 6px",
                    borderRadius: 6,
                    lineHeight: 1,
                }}
            >
                ⋮
            </button>
            {open && (
                <>
                    <div
                        onClick={() => setOpen(false)}
                        style={{ position: "fixed", inset: 0, zIndex: 10 }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            right: 0,
                            bottom: "100%",
                            background: "white",
                            border: "1px solid #e8e8e8",
                            borderRadius: 10,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                            zIndex: 20,
                            minWidth: 140,
                            overflow: "hidden",
                        }}
                    >
                        <button
                            onClick={() => {
                                onEdit();
                                setOpen(false);
                            }}
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                padding: "10px 16px",
                                fontSize: 13,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#1a1a1a",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#f5f5f5")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "none")
                            }
                        >
                            Edit
                        </button>
                        {row.status === "active" ? (
                            <button
                                onClick={() => {
                                    onSuspend();
                                    setOpen(false);
                                }}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "10px 16px",
                                    fontSize: 13,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#A32D2D",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "#f5f5f5")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "none")
                                }
                            >
                                Suspend
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    onActivate();
                                    setOpen(false);
                                }}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "10px 16px",
                                    fontSize: 13,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#3B6D11",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "#f5f5f5")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "none")
                                }
                            >
                                Activate
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ── validate ──────────────────────────────────────────────────────────────────
function validate(form: FormData): Partial<FormData> {
    const e: Partial<FormData> = {};
    if (!form.achievement_name.trim()) e.achievement_name = "Required";
    if (!form.achievement_detail.trim()) e.achievement_detail = "Required";
    if (!form.metric_key) e.metric_key = "Required";
    if (
        !form.required_count ||
        isNaN(Number(form.required_count)) ||
        Number(form.required_count) <= 0
    )
        e.required_count = "Must be a positive number";
    return e;
}

// ── main component ────────────────────────────────────────────────────────────
export default function AchievementsTable() {
    const { user } = useAuth();
    const instId = user?.inst_id;

    const [data, setData] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [sortKey, setSortKey] = useState<string>("count");
    const [sortDir, setSortDir] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState<FormData>(EMPTY_FORM);
    const [createErrors, setCreateErrors] = useState<Partial<FormData>>({});

    const [showEditModal, setShowEditModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Achievement | null>(null);
    const [editForm, setEditForm] = useState<FormData>(EMPTY_FORM);
    const [editErrors, setEditErrors] = useState<Partial<FormData>>({});

    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendTarget, setSuspendTarget] = useState<Achievement | null>(
        null,
    );

    const [showActivateModal, setShowActivateModal] = useState(false);
    const [activateTarget, setActivateTarget] = useState<Achievement | null>(
        null,
    );

    // ── fetch ────────────────────────────────────────────────────────────────
    const fetchAchievements = useCallback(async () => {
        if (!instId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/${instId}/admin/achievements/`);
            const raw = Array.isArray(res.data)
                ? res.data
                : (res.data.data ?? []);
            setData(raw.map(fromApi));
        } catch (e: any) {
            setError(
                e.response?.data?.detail ?? "Failed to fetch achievements",
            );
        } finally {
            setLoading(false);
        }
    }, [instId]);

    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);

    // ── create ───────────────────────────────────────────────────────────────
    const handleCreate = async () => {
        const e = validate(createForm);
        if (Object.keys(e).length > 0) {
            setCreateErrors(e);
            return;
        }
        try {
            await api.post(`/${instId}/admin/achievements/`, {
                achievement_name: createForm.achievement_name.trim(),
                achievement_detail: createForm.achievement_detail.trim(),
                metric_key: createForm.metric_key,
                required_count: Number(createForm.required_count),
                badge_url: createForm.badge_url || null,
            });
            setShowCreateModal(false);
            setCreateForm(EMPTY_FORM);
            setCreateErrors({});
            fetchAchievements();
        } catch (e: any) {
            setError(
                e.response?.data?.detail ?? "Failed to create achievement",
            );
        }
    };

    // ── edit ─────────────────────────────────────────────────────────────────
    const handleEdit = (row: Achievement) => {
        setEditTarget(row);
        setEditForm({
            achievement_name: row.name,
            achievement_detail: row.detail,
            metric_key: row.criteria,
            required_count: String(row.count),
            badge_url: row.badgeUrl ?? "",
        });
        setEditErrors({});
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        const e = validate(editForm);
        if (Object.keys(e).length > 0) {
            setEditErrors(e);
            return;
        }
        try {
            await api.put(`/${instId}/admin/achievements/${editTarget?.id}`, {
                achievement_name: editForm.achievement_name.trim(),
                achievement_detail: editForm.achievement_detail.trim(),
                metric_key: editForm.metric_key,
                required_count: Number(editForm.required_count),
                badge_url: editForm.badge_url || null,
            });
            setShowEditModal(false);
            setEditTarget(null);
            fetchAchievements();
        } catch (e: any) {
            setError(
                e.response?.data?.detail ?? "Failed to update achievement",
            );
        }
    };

    // ── suspend / activate ───────────────────────────────────────────────────
    const handleConfirmSuspend = async () => {
        try {
            await api.patch(
                `/${instId}/admin/achievements/${suspendTarget?.id}/suspend`,
            );
            setShowSuspendModal(false);
            setSuspendTarget(null);
            fetchAchievements();
        } catch (e: any) {
            setError(
                e.response?.data?.detail ?? "Failed to suspend achievement",
            );
        }
    };

    const handleConfirmActivate = async () => {
        try {
            await api.patch(
                `/${instId}/admin/achievements/${activateTarget?.id}/activate`,
            );
            setShowActivateModal(false);
            setActivateTarget(null);
            fetchAchievements();
        } catch (e: any) {
            setError(
                e.response?.data?.detail ?? "Failed to activate achievement",
            );
        }
    };

    // ── filter + sort ────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let rows = data.filter(
            (r) => !query || r.name.toLowerCase().includes(query.toLowerCase()),
        );
        if (sortKey) {
            rows = [...rows].sort((a, b) => {
                const av =
                    sortKey === "name"
                        ? a.name
                        : sortKey === "criteria"
                          ? a.criteria
                          : sortKey === "count"
                            ? a.count
                            : a.dateAdded;
                const bv =
                    sortKey === "name"
                        ? b.name
                        : sortKey === "criteria"
                          ? b.criteria
                          : sortKey === "count"
                            ? b.count
                            : b.dateAdded;
                return (av > bv ? 1 : av < bv ? -1 : 0) * sortDir;
            });
        }
        return rows;
    }, [data, query, sortKey, sortDir]);

    const grouped = useMemo(() => {
        const map: Record<string, Achievement[]> = {};
        filtered.forEach((r) => {
            if (!map[r.name]) map[r.name] = [];
            map[r.name].push(r);
        });
        return map;
    }, [filtered]);

    const toggleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => d * -1);
        else {
            setSortKey(key);
            setSortDir(1);
        }
    };

    const SortArrow = ({ k }: { k: string }) => (
        <span style={{ marginLeft: 4, opacity: sortKey === k ? 1 : 0.3 }}>
            {sortKey === k ? (sortDir === 1 ? "↑" : "↓") : "↕"}
        </span>
    );

    // ── styles ───────────────────────────────────────────────────────────────
    const thStyle = (clickable = true): CSSProperties => ({
        textAlign: "left",
        padding: "11px 16px",
        fontSize: 13,
        fontWeight: 600,
        color: "#555",
        background: "#fafafa",
        borderBottom: "1px solid #efefef",
        cursor: clickable ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
    });

    const tdStyle: CSSProperties = {
        padding: "12px 16px",
        borderBottom: "1px solid #f3f3f3",
        verticalAlign: "middle",
        fontSize: 13,
        color: "#1a1a1a",
    };

    const btnBase: CSSProperties = {
        border: "none",
        borderRadius: 8,
        padding: "8px 20px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
    };

    // ── render ───────────────────────────────────────────────────────────────
    return (
        <div
            style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                paddingTop: 24,
            }}
        >
            {/* Top bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                    gap: 12,
                }}
            >
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        type="text"
                        placeholder="Type to search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
                        style={{
                            padding: "7px 12px",
                            fontSize: 13,
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            outline: "none",
                            width: 200,
                        }}
                    />
                    <button
                        onClick={() => setQuery(search)}
                        style={{
                            padding: "7px 16px",
                            fontSize: 13,
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            background: "white",
                            cursor: "pointer",
                            fontWeight: 500,
                        }}
                    >
                        Search
                    </button>
                </div>
                <button
                    onClick={() => {
                        setCreateForm(EMPTY_FORM);
                        setCreateErrors({});
                        setShowCreateModal(true);
                    }}
                    style={{
                        ...btnBase,
                        background: "#2563EB",
                        color: "white",
                    }}
                >
                    + Create
                </button>
            </div>

            {/* Error */}
            {error && (
                <div
                    style={{
                        marginBottom: 12,
                        padding: "10px 16px",
                        background: "#FEE2E2",
                        border: "1px solid #FECACA",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#DC2626",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <span>{error}</span>
                    <button
                        onClick={fetchAchievements}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#DC2626",
                            fontWeight: 600,
                            fontSize: 13,
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Table */}
            <div
                style={{
                    border: "1px solid #efefef",
                    borderRadius: 12,
                    overflow: "visible",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ ...thStyle(false), width: 60 }}>
                                Badge
                            </th>
                            <th
                                style={{ ...thStyle(), width: "18%" }}
                                onClick={() => toggleSort("name")}
                            >
                                Achievement <SortArrow k="name" />
                            </th>
                            <th style={{ ...thStyle(false), width: "22%" }}>
                                Description
                            </th>
                            <th
                                style={{ ...thStyle(), width: "17%" }}
                                onClick={() => toggleSort("criteria")}
                            >
                                Criteria <SortArrow k="criteria" />
                            </th>
                            <th
                                style={{ ...thStyle(), width: 130 }}
                                onClick={() => toggleSort("count")}
                            >
                                Required Count <SortArrow k="count" />
                            </th>
                            <th style={{ ...thStyle(false), width: 110 }}>
                                Status
                            </th>
                            <th
                                style={{ ...thStyle(), width: 160 }}
                                onClick={() => toggleSort("date")}
                            >
                                Date Added <SortArrow k="date" />
                            </th>
                            <th style={{ ...thStyle(false), width: 48 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    style={{
                                        ...tdStyle,
                                        textAlign: "center",
                                        color: "#9CA3AF",
                                        padding: 48,
                                    }}
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    style={{
                                        ...tdStyle,
                                        textAlign: "center",
                                        color: "#9CA3AF",
                                        padding: 48,
                                    }}
                                >
                                    No achievements found
                                </td>
                            </tr>
                        ) : (
                            Object.entries(grouped).map(([group, items]) => (
                                <>
                                    <tr key={`g-${group}`}>
                                        <td
                                            colSpan={8}
                                            style={{
                                                padding: "7px 16px",
                                                background: "#f5f5f5",
                                                borderBottom:
                                                    "1px solid #efefef",
                                                borderTop: "1px solid #efefef",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: "#888",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.07em",
                                            }}
                                        >
                                            {group} · {items.length}{" "}
                                            {items.length === 1
                                                ? "tier"
                                                : "tiers"}
                                        </td>
                                    </tr>
                                    {items.map((r) => (
                                        <tr
                                            key={r.id}
                                            onMouseEnter={(e) =>
                                                Array.from(
                                                    e.currentTarget.cells,
                                                ).forEach(
                                                    (c) =>
                                                        (c.style.background =
                                                            "#fafafa"),
                                                )
                                            }
                                            onMouseLeave={(e) =>
                                                Array.from(
                                                    e.currentTarget.cells,
                                                ).forEach(
                                                    (c) =>
                                                        (c.style.background =
                                                            ""),
                                                )
                                            }
                                        >
                                            <td style={tdStyle}>
                                                <div
                                                    style={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: "50%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 16,
                                                        background: "#f3f3f3",
                                                        border: "1px solid #eee",
                                                    }}
                                                >
                                                    {r.badgeUrl ? (
                                                        <img
                                                            src={r.badgeUrl}
                                                            alt=""
                                                            style={{
                                                                width: 24,
                                                                height: 24,
                                                                objectFit:
                                                                    "cover",
                                                                borderRadius:
                                                                    "50%",
                                                            }}
                                                        />
                                                    ) : (
                                                        BADGE_ICONS[r.name] ||
                                                        "🏅"
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {r.name}
                                            </td>
                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    color: "#555",
                                                }}
                                            >
                                                {r.detail}
                                            </td>
                                            <td style={tdStyle}>
                                                <CriteriaPill
                                                    criteria={r.criteria}
                                                />
                                            </td>
                                            <td style={tdStyle}>{r.count}</td>
                                            <td style={tdStyle}>
                                                <StatusBadge
                                                    status={r.status}
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    color: "#888",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {r.dateAdded}
                                            </td>
                                            <td
                                                style={{
                                                    ...tdStyle,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <RowMenu
                                                    row={r}
                                                    onEdit={() => handleEdit(r)}
                                                    onSuspend={() => {
                                                        setSuspendTarget(r);
                                                        setShowSuspendModal(
                                                            true,
                                                        );
                                                    }}
                                                    onActivate={() => {
                                                        setActivateTarget(r);
                                                        setShowActivateModal(
                                                            true,
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div
                    style={overlayStyle}
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        style={modalStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: 20,
                            }}
                        >
                            Create Achievement
                        </div>
                        <AchievementForm
                            form={createForm}
                            setForm={setCreateForm}
                            errors={createErrors}
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 10,
                                marginTop: 20,
                            }}
                        >
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #E8ECF2",
                                    borderRadius: 8,
                                    padding: "8px 20px",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    color: "#374151",
                                    fontWeight: 500,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                style={{
                                    ...btnBase,
                                    background: "#2563EB",
                                    color: "#fff",
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div
                    style={overlayStyle}
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        style={modalStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: 20,
                            }}
                        >
                            Edit Achievement
                        </div>
                        <AchievementForm
                            form={editForm}
                            setForm={setEditForm}
                            errors={editErrors}
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 10,
                                marginTop: 20,
                            }}
                        >
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #E8ECF2",
                                    borderRadius: 8,
                                    padding: "8px 20px",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    color: "#374151",
                                    fontWeight: 500,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                style={{
                                    ...btnBase,
                                    background: "#2563EB",
                                    color: "#fff",
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Modal */}
            {showSuspendModal && (
                <div
                    style={overlayStyle}
                    onClick={() => setShowSuspendModal(false)}
                >
                    <div
                        style={{ ...modalStyle, width: 360 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: 20,
                            }}
                        >
                            Suspend Achievement
                        </div>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#374151",
                                marginBottom: 4,
                            }}
                        >
                            Are you sure you want to suspend{" "}
                            <strong>{suspendTarget?.name}</strong>?
                        </p>
                        <p style={{ fontSize: 13, color: "#6B7280" }}>
                            The achievement will be hidden from users but all
                            data will be retained.
                        </p>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 10,
                                marginTop: 20,
                            }}
                        >
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #E8ECF2",
                                    borderRadius: 8,
                                    padding: "8px 20px",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    color: "#374151",
                                    fontWeight: 500,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSuspend}
                                style={{
                                    ...btnBase,
                                    background: "#DC2626",
                                    color: "#fff",
                                }}
                            >
                                Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Activate Modal */}
            {showActivateModal && (
                <div
                    style={overlayStyle}
                    onClick={() => setShowActivateModal(false)}
                >
                    <div
                        style={{ ...modalStyle, width: 360 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: 20,
                            }}
                        >
                            Activate Achievement
                        </div>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#374151",
                                marginBottom: 4,
                            }}
                        >
                            Are you sure you want to activate{" "}
                            <strong>{activateTarget?.name}</strong>?
                        </p>
                        <p style={{ fontSize: 13, color: "#6B7280" }}>
                            The achievement will be visible to users again.
                        </p>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 10,
                                marginTop: 20,
                            }}
                        >
                            <button
                                onClick={() => setShowActivateModal(false)}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #E8ECF2",
                                    borderRadius: 8,
                                    padding: "8px 20px",
                                    fontSize: 13,
                                    cursor: "pointer",
                                    color: "#374151",
                                    fontWeight: 500,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmActivate}
                                style={{
                                    ...btnBase,
                                    background: "#16A34A",
                                    color: "#fff",
                                }}
                            >
                                Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
