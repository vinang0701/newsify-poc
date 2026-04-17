import { useState, useEffect, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Institution {
  id: string;
  name: string;
  domain: string;
  phone: string | null;
  plan: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  plan: string;
  startDate: string;
  endDate: string;
}

const PLANS = ["Basic", "Pro"];

// ── Dynamic style helpers ─────────────────────────────────────────────────────
const statusBadge = (status: string): CSSProperties => ({
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    status === "Active" ? "#DCFCE7" : status === "Suspended" ? "#FEE2E2" : "#F3F4F6",
  color:
    status === "Active" ? "#16A34A" : status === "Suspended" ? "#DC2626" : "#6B7280",
});

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, CSSProperties> = {
  page: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#F4F6FA",
    minHeight: "100vh",
  },
  header: { fontSize: 22, fontWeight: 700, color: "#111827" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  searchWrap: { display: "flex", border: "1px solid #E8ECF2", borderRadius: 8, overflow: "hidden", width: 320 },
  searchInput: { border: "none", padding: "8px 14px", fontSize: 13, flex: 1, outline: "none", background: "#fff" },
  searchBtn: { background: "#2563EB", color: "#fff", border: "none", padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 500, borderRadius: 0 },
  createBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  tableCard: { background: "#fff", borderRadius: 12, border: "1px solid #E8ECF2" },
  tableHeader: { padding: "14px 20px", borderBottom: "1px solid #E8ECF2", display: "flex", alignItems: "center", justifyContent: "space-between" },
  resultsLabel: { fontSize: 14, fontWeight: 600, color: "#111827" },
  sortBtn: { background: "#F4F6FA", border: "1px solid #E8ECF2", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: "#4B5563" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#6B7280", background: "#F9FAFB", borderBottom: "1px solid #E8ECF2" },
  td: { padding: "12px 16px", fontSize: 13, color: "#374151", borderBottom: "1px solid #F3F4F6" },
  emptyCell: { padding: "48px 16px", textAlign: "center", color: "#9CA3AF", fontSize: 14 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modal: { background: "#fff", borderRadius: 14, padding: "28px 32px", width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 20 },
  formGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 5, display: "flex", gap: 4 },
  required: { color: "#EF4444" },
  input: { width: "100%", border: "1px solid #E8ECF2", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#F9FAFB" },
  select: { width: "100%", border: "1px solid #E8ECF2", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#F9FAFB" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  cancelBtn: { background: "#fff", border: "1px solid #E8ECF2", borderRadius: 8, padding: "8px 20px", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 },
  submitBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  errorText: { color: "#EF4444", fontSize: 11, marginTop: 3 },
  menuWrap: { position: "relative" as const },
  menuBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: 18, color: "#6B7280" },
  dropdown: { position: "absolute" as const, right: 0, top: "110%", background: "#fff", border: "1px solid #E8ECF2", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: 130, zIndex: 30, overflow: "hidden" },
  dropdownItem: { padding: "9px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#374151" },
  dropdownItemDanger: { padding: "9px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#DC2626" },
  suspendBtn: { background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  errorBanner: { background: "#FEE2E2", color: "#DC2626", borderRadius: 8, padding: "10px 16px", fontSize: 13 },
};

// ── Component ─────────────────────────────────────────────────────────────────
const InstitutionsMgmtPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", plan: "", startDate: "", endDate: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // ── Fetch all institutions ──
  const fetchInstitutions = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("institutions")
      .select("id, name, domain, phone, plan, status, start_date, end_date")
      .order("created_at", { ascending: true });

    if (error) setError(error.message);
    else setInstitutions(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", plan: "", startDate: "", endDate: "" });
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.plan) e.plan = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Create ──
  const handleCreate = async () => {
    if (!validate()) return;
    const { error } = await supabase.from("institutions").insert({
      name: form.name,
      domain: form.email.split("@")[1] || "",
      phone: form.phone || null,
      plan: form.plan,
      status: "Active",
      start_date: form.startDate,
      end_date: form.endDate,
    });
    if (error) { setError(error.message); return; }
    setShowModal(false);
    resetForm();
    fetchInstitutions();
  };

  // ── Update ──
  const openUpdate = (inst: Institution) => {
    setSelectedId(inst.id);
    setForm({
      name: inst.name,
      email: `admin@${inst.domain}`,
      phone: inst.phone ?? "",
      plan: inst.plan ?? "",
      startDate: inst.start_date ?? "",
      endDate: inst.end_date ?? "",
    });
    setErrors({});
    setOpenMenuId(null);
    setShowUpdateModal(true);
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    const { error } = await supabase
      .from("institutions")
      .update({
        name: form.name,
        domain: form.email.split("@")[1] || "",
        phone: form.phone || null,
        plan: form.plan,
        start_date: form.startDate,
        end_date: form.endDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedId);
    if (error) { setError(error.message); return; }
    setShowUpdateModal(false);
    resetForm();
    fetchInstitutions();
  };

  // ── Suspend ──
  const openSuspend = (id: string) => {
    setSelectedId(id);
    setOpenMenuId(null);
    setShowSuspendModal(true);
  };

  const handleSuspend = async () => {
    const { error } = await supabase
      .from("institutions")
      .update({ status: "Suspended", updated_at: new Date().toISOString() })
      .eq("id", selectedId);
    if (error) { setError(error.message); return; }
    setShowSuspendModal(false);
    fetchInstitutions();
  };

  const handleActivate = async (id: string) => {
  	setOpenMenuId(null);
  	const { error } = await supabase
    	.from("institutions")
    	.update({ status: "Active", updated_at: new Date().toISOString() })
    	.eq("id", id);
  	if (error) { setError(error.message); return; }
  	fetchInstitutions();
	};

  const filtered = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.domain.toLowerCase().includes(query.toLowerCase())
  );

  const selectedInst = institutions.find((i) => i.id === selectedId);

  return (
    <div style={s.page} onClick={() => setOpenMenuId(null)}>
      <div style={s.header}>Institution Account Management</div>

      {error && <div style={s.errorBanner}>{error}</div>}

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <input
            style={s.searchInput}
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
          />
          <button style={s.searchBtn} onClick={() => setQuery(search)}>Search</button>
        </div>
        <button style={s.createBtn} onClick={() => { resetForm(); setShowModal(true); }}>
          <span>＋</span> Create
        </button>
      </div>

      {/* Table */}
      <div style={s.tableCard}>
        <div style={s.tableHeader}>
          <span style={s.resultsLabel}>Results: {filtered.length}</span>
          <button style={s.sortBtn}>Sort ▾</button>
        </div>
        <table style={s.table}>
          <thead>
            <tr>
              {["Name", "Domain", "Phone Number", "Plan", "Status", "Start Date", "End Date", ""].map(
                (col) => <th key={col} style={s.th}>{col}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={s.emptyCell}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={s.emptyCell}>No institutions found.</td></tr>
            ) : (
              filtered.map((inst) => (
                <tr key={inst.id}>
                  <td style={s.td}>{inst.name}</td>
                  <td style={s.td}>{inst.domain}</td>
                  <td style={s.td}>{inst.phone ?? "-"}</td>
                  <td style={s.td}>{inst.plan ?? "-"}</td>
                  <td style={s.td}>
                    <span style={statusBadge(inst.status)}>{inst.status}</span>
                  </td>
                  <td style={s.td}>{inst.start_date ?? "-"}</td>
                  <td style={s.td}>{inst.end_date ?? "-"}</td>
                  <td style={{ ...s.td, width: 40 }}>
                    <div style={s.menuWrap} onClick={(e) => e.stopPropagation()}>
                      <button
                        style={s.menuBtn}
                        onClick={() => setOpenMenuId(openMenuId === inst.id ? null : inst.id)}
                      >
                        ⋮
                      </button>
                      {openMenuId === inst.id && (
                        <div style={s.dropdown}>
                          <div style={s.dropdownItem} onClick={() => openUpdate(inst)}>✏️ Update</div>
                          {inst.status !== "Suspended" ? (
  							<div style={s.dropdownItemDanger} onClick={() => openSuspend(inst.id)}>🚫 Suspend</div>
						  ) : (
  							<div style={s.dropdownItem} onClick={() => handleActivate(inst.id)}>✅ Activate</div>
						  )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={s.overlay} onClick={() => { setShowModal(false); resetForm(); }}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>Create Institution Account</div>
            <ModalFormFields form={form} setForm={setForm} errors={errors} />
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              <button style={s.submitBtn} onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div style={s.overlay} onClick={() => { setShowUpdateModal(false); resetForm(); }}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>→ Update Institution Account</div>
            <ModalFormFields form={form} setForm={setForm} errors={errors} />
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => { setShowUpdateModal(false); resetForm(); }}>Cancel</button>
              <button style={s.submitBtn} onClick={handleUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirm Modal */}
      {showSuspendModal && (
        <div style={s.overlay} onClick={() => setShowSuspendModal(false)}>
          <div style={{ ...s.modal, width: 360 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>Suspend Account</div>
            <p style={{ fontSize: 14, color: "#374151", marginBottom: 4 }}>
              Are you sure you want to suspend <strong>{selectedInst?.name}</strong>?
            </p>
            <p style={{ fontSize: 13, color: "#6B7280" }}>
              Access will be disabled but all data will be retained.
            </p>
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowSuspendModal(false)}>Cancel</button>
              <button style={s.suspendBtn} onClick={handleSuspend}>Suspend</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Shared form fields ────────────────────────────────────────────────────────
const ModalFormFields = ({
  form,
  setForm,
  errors,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Partial<FormData>;
}) => (
  <>
    <div style={s.formGroup}>
      <label style={s.label}>Institution Name <span style={s.required}>*</span></label>
      <input
        style={{ ...s.input, borderColor: errors.name ? "#EF4444" : "#E8ECF2" }}
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        placeholder="Enter institution name"
      />
      {errors.name && <div style={s.errorText}>{errors.name}</div>}
    </div>

    <div style={s.formGroup}>
      <label style={s.label}>Institution Email <span style={s.required}>*</span></label>
      <input
        style={{ ...s.input, borderColor: errors.email ? "#EF4444" : "#E8ECF2" }}
        type="email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        placeholder="Enter institution email"
      />
      {errors.email && <div style={s.errorText}>{errors.email}</div>}
    </div>

    <div style={s.formGroup}>
      <label style={s.label}>Phone Number</label>
      <input
        style={s.input}
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        placeholder="Enter phone number"
      />
    </div>

    <div style={s.formGroup}>
      <label style={s.label}>Subscription Plan <span style={s.required}>*</span></label>
      <select
        style={{ ...s.select, borderColor: errors.plan ? "#EF4444" : "#E8ECF2" }}
        value={form.plan}
        onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
      >
        <option value="">Select a Subscription Plan</option>
        {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      {errors.plan && <div style={s.errorText}>{errors.plan}</div>}
    </div>

    <div style={s.formGroup}>
      <label style={s.label}>Start Date <span style={s.required}>*</span></label>
      <input
        style={{ ...s.select, borderColor: errors.startDate ? "#EF4444" : "#E8ECF2" }}
        type="date"
        value={form.startDate}
        onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
      />
      {errors.startDate && <div style={s.errorText}>{errors.startDate}</div>}
    </div>

    <div style={s.formGroup}>
      <label style={s.label}>End Date <span style={s.required}>*</span></label>
      <input
        style={{ ...s.select, borderColor: errors.endDate ? "#EF4444" : "#E8ECF2" }}
        type="date"
        value={form.endDate}
        onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
      />
      {errors.endDate && <div style={s.errorText}>{errors.endDate}</div>}
    </div>
  </>
);

export default InstitutionsMgmtPage;
