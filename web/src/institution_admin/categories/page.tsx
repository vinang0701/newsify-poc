import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import CategoriesDataTable from "./data-table";
import { getCategoriesColumns } from "./columns";
import type { CategoryTable } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

import { useAuth } from "@/components/auth-provider";
import Loading from "@/components/loading";
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

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [query, setQuery] = useState("");

	// sam
	const queryClient = useQueryClient();
	const [createOpen, setCreateOpen] = useState(false);
	const [newName, setNewName] = useState("");

	// Edit modal
	const [showEditModal, setShowEditModal] = useState(false);
	const [editTargetId, setEditTargetId] = useState("");
	const [editName, setEditName] = useState("");
	const [editStatus, setEditStatus] = useState("");
	const [editError, setEditError] = useState("");

	// Suspend modal
	const [showSuspendModal, setShowSuspendModal] = useState(false);
	const [suspendTarget, setSuspendTarget] = useState("");

	// Activate modal
	const [showActivateModal, setShowActivateModal] = useState(false);
	const [activateTarget, setActivateTarget] = useState("");

	// Hard delete modal
	const [showHardDeleteModal, setShowHardDeleteModal] = useState(false);
	const [hardDeleteTarget, setHardDeleteTarget] = useState("");

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
	// Edit
	const handleEditPress = (category: CategoryTable) => {
		setEditTargetId(category.category_id);
		setEditName(category.category_name);
		setEditStatus(category.status);
		setEditError("");
		setShowEditModal(true);
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
				setEditError("Update failed: " + err.message);
				console.error("Update failed:", err);
			},
		});

	const onEditSubmit = () => {
		if (!editName.trim()) {
			setEditError("Category name is required.");
			return;
		}
		mu_editCategory();
	};

	const handleSuspendPress = (category: CategoryTable) => {
		setSuspendTarget(category.category_id);
		setEditName(category.category_name);
		setShowSuspendModal(true);
	};

	const { mutate: mu_suspend, isPending: isPendingSuspend } = useMutation({
		mutationFn: async () => {
			const formData = new FormData();
			if (editName !== undefined)
				formData.append("category_name", editName);
			formData.append("status", "inactive");
			const response = await api.patch(
				`/${user?.inst_id}/admin/categories/${suspendTarget}`,
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
			setEditName("");
			setSuspendTarget("");
			setShowSuspendModal(false);
		},
		onError: (err) => {
			setError(err.message);
			console.error("Update failed:", err);
		},
		onSettled: () => {
			setShowSuspendModal(false);
		},
	});

	const handleActivatePress = (category: CategoryTable) => {
		setActivateTarget(category.category_id);
		setEditName(category.category_name);
		setShowActivateModal(true);
	};

	const { mutate: mu_activate, isPending: isPendingActivate } = useMutation({
		mutationFn: async () => {
			const formData = new FormData();
			if (editName !== undefined)
				formData.append("category_name", editName);
			formData.append("status", "active");
			const response = await api.patch(
				`/${user?.inst_id}/admin/categories/${activateTarget}`,
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
			setEditName("");
			setActivateTarget("");
			setShowActivateModal(false);
		},
		onError: (err: any) => {
			console.error("Update failed:", err.response?.data.details);
		},
	});

	const handleHardDeletePress = (category: CategoryTable) => {
		setHardDeleteTarget(category.category_id);
		setEditName(category.category_name);
		setShowHardDeleteModal(true);
	};

	const { mutate: mu_hardDelete, isPending: isPendingHardDelete } =
		useMutation({
			mutationFn: async () => {
				const response = await api.delete(
					`/${user?.inst_id}/admin/categories/${hardDeleteTarget}?hard=true`,
				);
				queryClient.invalidateQueries({
					queryKey: ["adminCategories"],
				});
				return response.data;
			},
			onSuccess: () => {
				// Refresh the list after a successful update
				queryClient.invalidateQueries({
					queryKey: ["adminCategories"],
				});
				setEditName("");
				setHardDeleteTarget("");
				setShowHardDeleteModal(false);
			},
			onError: (err: any) => {
				console.error("Update failed:", err.response?.data.details);
			},
		});

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

	const columns = useMemo(
		() =>
			getCategoriesColumns(
				handleEditPress,
				handleSuspendPress,
				handleActivatePress,
				handleHardDeletePress,
			),
		[instId],
	);

	const filteredCategories = categories?.filter((cat) =>
		query.trim() === ""
			? true
			: cat.category_name.toLowerCase().includes(query.toLowerCase()),
	);

	return (
		<div>
			{(isLoading ||
				loading ||
				isPendingEditCategory ||
				isPendingSuspend ||
				isPendingActivate ||
				isPendingHardDelete) && <Loading />}

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
					</div>
					<CategoriesDataTable
						data={filteredCategories ?? []}
						columns={columns}
					/>
				</section>
			</div>

			{/* Add Category Dialog */}
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
										setEditError("");
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
									setEditError("");
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

			{/* Edit Modal */}
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
										setEditError("");
									}}
								/>
							</div>
							{editError && (
								<div className="mt-1 text-sm text-destructive">
									{editError}
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
									setEditError("");
								}}
							>
								Cancel
							</Button>
							<Button
								type="button"
								variant={"default"}
								// className="rounded-lg bg-blue-600 px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-85"
								className="px-4 py-2"
								onClick={onEditSubmit}
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
							<strong>{editName}</strong>?
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
								onClick={() => mu_suspend()}
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
							<strong>{editName}</strong>?
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
								onClick={() => mu_activate()}
							>
								Activate
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Activate Modal */}
			{showHardDeleteModal && (
				<div
					style={overlayStyle}
					onClick={() => setShowHardDeleteModal(false)}
				>
					<div
						style={{ ...modalStyle, width: 360 }}
						onClick={(e) => e.stopPropagation()}
					>
						<div style={modalTitleStyle}>
							Permanently Delete Category
						</div>
						<p
							style={{
								fontSize: 14,
								color: "#374151",
								marginBottom: 4,
							}}
						>
							Are you sure you want to permanently delete{" "}
							<strong>{editName}</strong>?
						</p>
						<p style={{ fontSize: 13, color: "#6B7280" }}>
							This action cannot be undone.
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
								onClick={() => setShowHardDeleteModal(false)}
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
								onClick={() => mu_hardDelete()}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CategoriesMgmtPage;
