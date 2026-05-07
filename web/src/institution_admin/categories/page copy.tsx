import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import { ChevronDown, Plus } from "lucide-react";
import CategoriesDataTable from "./data-table";
import { getCategoriesColumns } from "./columns";
import type { CategoryTable } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth-provider";
import Loading from "@/components/loading";
import CategoryForm from "./category-form";
import { Label } from "@/components/ui/label";

// ── Modal styles ──────────────────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
};
const modalStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 14,
    padding: "24px 32px",
    width: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
};
const modalTitleStyle: React.CSSProperties = {
    fontSize: 17,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 20,
};

const modalActionsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
};
const cancelBtnStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E8ECF2",
    borderRadius: 8,
    padding: "8px 20px",
    fontSize: 13,
    cursor: "pointer",
    color: "#374151",
    fontWeight: 500,
};

const suspendBtnStyle: React.CSSProperties = {
    background: "#DC2626",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
};
const activateBtnStyle: React.CSSProperties = {
    background: "#16A34A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
};

// ── Component ─────────────────────────────────────────────────────────────────
const CategoriesMgmtPage = () => {
    const { user } = useAuth();
    const instId = user?.inst_id;

    const [data, setData] = useState<CategoryTable[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");

    // sam
    const queryClient = useQueryClient();
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");

    // const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTargetId, setEditTargetId] = useState("");
    const [editName, setEditName] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [editError, setEditError] = useState("");

    // Suspend modal
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendTarget, setSuspendTarget] = useState<CategoryTable | null>(
        null,
    );

    // Activate modal
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [activateTarget, setActivateTarget] = useState<CategoryTable | null>(
        null,
    );

    // ── Fetch categories ──
    // Fetch all categories from backend
    const { data: categories, isLoading } = useQuery<CategoryTable[]>({
        queryKey: ["adminCategories"],
        queryFn: async () => {
            const response = await api.get(
                `/${user?.inst_id}/admin/categories`,
            );
            return response.data;
        },
    });

    // ── Handlers ──
    const handleEdit = (category: CategoryTable) => {
        setEditTargetId(category.category_id);
        setEditName(category.category_name);
        setEditStatus(category.status);
        setEditError("");
        setShowEditModal(true);
    };

    // const handleSaveEdit = async () => {
    //     if (!editName.trim()) {
    //         setEditError("Category name is required");
    //         return;
    //     }
    //     try {
    //         await api.put(`/${instId}/admin/categories/${editTargetId}`, {
    //             category_name: editName.trim(),
    //         });
    //         setShowEditModal(false);
    //         setEditTargetId("");
    //         queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
    //     } catch (e: any) {
    //         setEditError(
    //             e.response?.data?.detail ?? "Failed to update category",
    //         );
    //     }
    // };
    const handleSaveEdit = async () => {
        setLoading(true);
        if (!editName.trim()) {
            setEditError("Category name is required");
            return;
        }
        console.log(editTargetId);
        console.log(editName);
        console.log(editStatus);
        try {
            const formData = new FormData();
            formData.append("category_name", editName);
            formData.append("status", editStatus);
            await api.patch(
                `/${user?.inst_id}/admin/categories/${editTargetId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            );
            queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
            setShowEditModal(false);
        } catch (err) {
            console.error("Edit failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = (category: CategoryTable) => {
        setSuspendTarget(category);
        setShowSuspendModal(true);
    };

    const handleConfirmSuspend = async () => {
        try {
            await api.patch(
                `/${instId}/admin/categories/${suspendTarget?.id}/suspend`,
            );
            setShowSuspendModal(false);
            setSuspendTarget(null);
            // fetchCategories();
        } catch (e: any) {
            setError(e.response?.data?.detail ?? "Failed to suspend category");
        }
    };

    const handleActivate = (category: CategoryTable) => {
        setActivateTarget(category);
        setShowActivateModal(true);
    };

    const handleConfirmActivate = async () => {
        try {
            await api.patch(
                `/${instId}/admin/categories/${activateTarget?.id}/activate`,
            );
            setShowActivateModal(false);
            setActivateTarget(null);
            // fetchCategories();
        } catch (e: any) {
            setError(e.response?.data?.detail ?? "Failed to activate category");
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) {
            setError("Category name is required.");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("category_name", newName);

            await api.post(`/${user?.inst_id}/admin/categories`, formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
            setNewName("");
            setCreateOpen(false);
        } catch (err) {
            console.error("Add failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const { mutate: mu_editCategory, isPending: isPendingEditCategory } =
        useMutation({
            mutationFn: async () => {
                const formData = new FormData();
                if (editName !== undefined)
                    formData.append("category_name", editName);
                if (editStatus !== undefined)
                    formData.append("status", editStatus);
                const response = await api.patch(
                    `/${user?.inst_id}/admin/categories/${editTargetId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    },
                );
                return response.data;
            },
            onSuccess: () => {
                // Refresh the list after a successful update
                queryClient.invalidateQueries({
                    queryKey: ["adminCategories"],
                });
                setShowEditModal(false);
            },
            onError: (err) => {
                console.error("Update failed:", err);
            },
        });

    const columns = useMemo(
        () => getCategoriesColumns(handleEdit, handleSuspend, handleActivate),
        [instId],
    );

    const filtered = data.filter((c) =>
        c.category_name.toLowerCase().includes(query.toLowerCase()),
    );

    const filteredCategories = categories?.filter((cat) =>
        searchQuery.trim() === ""
            ? true
            : cat.category_name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()),
    );

    return (
        <div>
            {(isLoading || loading) && <Loading />}

            {/* Add Category Dialog */}
            {/* <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                        <DialogDescription>
                            Fill in the details to add a new category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Category Name{" "}
                                <span className="text-destructive">*</span>
                            </label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter category name"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setNewName("");
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleCreate}
                            disabled={loading || !newName.trim()}
                        >
                            {loading ? "Adding..." : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
            {createOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/35"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="w-[500px] flex flex-col gap-6 rounded-lg bg-white px-8 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-2xl font-bold">
                            Create Category
                        </div>

                        <div>
                            <div className="flex flex-row gap-3 items-center">
                                <Label className="text-base">Name</Label>
                                <Input
                                    className={`rounded-lg border border-muted-foreground text-base transition-colors `}
                                    placeholder="Enter category name"
                                    value={newName}
                                    onChange={(e) => {
                                        setNewName(e.target.value);
                                        setError("");
                                    }}
                                />
                            </div>
                            {error && (
                                <div className="mt-1 text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant={"ghost"}
                                // className="rounded-lg border border-[#E8ECF2] bg-white px-5 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setCreateOpen(false);
                                    setNewName("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant={"default"}
                                className="px-4 py-2"
                                onClick={handleCreate}
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="px-4 py-6 text-2xl font-bold border-b border-border">
                    Categories
                </div>
                <section className="flex flex-col py-3 px-4 gap-6">
                    {error && (
                        <div
                            style={{
                                background: "#FEE2E2",
                                color: "#DC2626",
                                borderRadius: 8,
                                padding: "10px 16px",
                                fontSize: 13,
                            }}
                        >
                            {error}
                        </div>
                    )}
                    {/* Search */}
                    <div className="flex flex-row justify-end gap-4">
                        <ButtonGroup className="flex flex-row">
                            <Input
                                type="text"
                                placeholder="Type to search..."
                                // value={searchQuery}
                                // onChange={(e) => setSearchQuery(e.target.value)}
                                className="placeholder:text-border pl-2 border-border rounded-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && setQuery(search)
                                }
                            />
                            <Button
                                className="rounded-sm border border-border text-foreground bg-card hover:bg-card/40 font-semibold"
                                onClick={() => setQuery(search)}
                            >
                                Search
                            </Button>
                        </ButtonGroup>
                        <Button
                            className="rounded-sm font-semibold border border-border px-5"
                            onClick={() => setCreateOpen(true)}
                        >
                            Create
                            <Plus strokeWidth={3} />
                        </Button>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <div className="font-bold text-2xl">
                            Results: {filteredCategories?.length ?? 0}
                        </div>
                        <Button
                            variant="outline"
                            className="flex flex-row items-center gap-1 text-foreground bg-card hover:bg-card/40 rounded-sm w-fit"
                        >
                            Sort
                            <ChevronDown />
                        </Button>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationLink href="#" isActive>
                                        1
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#">2</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#">3</PaginationLink>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                    <CategoriesDataTable
                        data={filteredCategories ?? []}
                        columns={columns}
                    />
                </section>
            </div>

            {/* Edit Modal */}
            {/* {showEditModal && (
                <div
                    style={overlayStyle}
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        style={modalStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={modalTitleStyle}>Edit Category</div>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Category Name *</label>
                            <input
                                style={{
                                    ...inputStyle,
                                    borderColor: editError
                                        ? "#EF4444"
                                        : "#E8ECF2",
                                }}
                                value={editName}
                                onChange={(e) => {
                                    setEditName(e.target.value);
                                    setEditError("");
                                }}
                                placeholder="Enter category name"
                                autoFocus
                            />
                            {editError && (
                                <div style={errorStyle}>{editError}</div>
                            )}
                        </div>
                        <div style={modalActionsStyle}>
                            <button
                                style={cancelBtnStyle}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "#F3F4F6")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "#fff")
                                }
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={saveBtnStyle}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.opacity = "0.85")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.opacity = "1")
                                }
                                onClick={handleSaveEdit}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
            {showEditModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/35"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="w-[500px] flex flex-col gap-6 rounded-lg bg-white px-8 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-2xl font-bold">Edit Category</div>

                        <div>
                            <div className="flex flex-row gap-3 items-center">
                                <Label className="text-base">Name</Label>
                                <Input
                                    className={`rounded-lg border border-muted-foreground text-base transition-colors `}
                                    placeholder="Enter category name"
                                    value={editName}
                                    onChange={(e) => {
                                        setEditName(e.target.value);
                                        setError("");
                                    }}
                                />
                            </div>
                            {error && (
                                <div className="mt-1 text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant={"ghost"}
                                // className="rounded-lg border border-[#E8ECF2] bg-white px-5 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditName("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant={"default"}
                                // className="rounded-lg bg-blue-600 px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
                                className="px-4 py-2"
                                onClick={handleSaveEdit}
                            >
                                Edit
                            </Button>
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
                        <div style={modalTitleStyle}>Suspend Category</div>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#374151",
                                marginBottom: 4,
                            }}
                        >
                            Are you sure you want to suspend{" "}
                            <strong>{suspendTarget?.category_name}</strong>?
                        </p>
                        <p style={{ fontSize: 13, color: "#6B7280" }}>
                            The category will be hidden but all associated news
                            archives will be retained.
                        </p>
                        <div style={modalActionsStyle}>
                            <button
                                style={cancelBtnStyle}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "#F3F4F6")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "#fff")
                                }
                                onClick={() => setShowSuspendModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={suspendBtnStyle}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "#991B1B")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                        "#DC2626")
                                }
                                onClick={handleConfirmSuspend}
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
                        <div style={modalTitleStyle}>Activate Category</div>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#374151",
                                marginBottom: 4,
                            }}
                        >
                            Are you sure you want to activate{" "}
                            <strong>{activateTarget?.category_name}</strong>?
                        </p>
                        <p style={{ fontSize: 13, color: "#6B7280" }}>
                            The category will be visible again to users.
                        </p>
                        <div style={modalActionsStyle}>
                            <button
                                style={cancelBtnStyle}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "#F3F4F6")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "#fff")
                                }
                                onClick={() => setShowActivateModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={activateBtnStyle}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "#15803D")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                        "#16A34A")
                                }
                                onClick={handleConfirmActivate}
                            >
                                Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesMgmtPage;
