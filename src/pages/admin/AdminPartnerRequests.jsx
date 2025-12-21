import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

const TIER_DEFAULT = { BASE: 10, PRO: 15, ELITE: 20 };

export default function AdminPartnerRequests() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // ---- Approve modal ----
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveReq, setApproveReq] = useState(null);
  const [tier, setTier] = useState("BASE");
  const [commissionOverride, setCommissionOverride] = useState("");

  const fetchRows = async () => {
    setError("");
    setOk("");
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get("/admin/partner-requests", { params });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setError(
        "Errore caricamento richieste partner (token o server non raggiungibile)."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const counts = useMemo(() => {
    const c = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    for (const r of rows) {
      if (r?.status && c[r.status] !== undefined) c[r.status] += 1;
    }
    return c;
  }, [rows]);

  const openApprove = (r) => {
    setError("");
    setOk("");
    setApproveReq(r);
    const initialTier = String(r?.partner_tier || "BASE").toUpperCase();
    setTier(TIER_DEFAULT[initialTier] ? initialTier : "BASE");
    setCommissionOverride("");
    setApproveOpen(true);
  };

  const closeApprove = () => {
    setApproveOpen(false);
    setApproveReq(null);
    setCommissionOverride("");
    setTier("BASE");
  };

  const approve = async () => {
    if (!approveReq?.id) return;
    setError("");
    setOk("");
    setBusyId(approveReq.id);

    try {
      const params = { tier };

      if (commissionOverride.trim() !== "") {
        const val = Number(commissionOverride.replace(",", "."));
        if (Number.isNaN(val) || val < 0 || val > 100) {
          throw new Error("Commissione non valida (0-100).");
        }
        params.commission_pct = val;
      }

      await apiClient.post(
        `/admin/partner-requests/${approveReq.id}/approve`,
        null,
        { params }
      );

      setOk("Richiesta approvata e partner creato ✅");
      closeApprove();
      await fetchRows();
    } catch (e) {
      console.error(e);
      const serverMsg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Errore approvazione richiesta.";
      setError(serverMsg);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    setError("");
    setOk("");
    const sure = window.confirm("Confermi il rifiuto della richiesta?");
    if (!sure) return;

    setBusyId(id);
    try {
      await apiClient.post(`/admin/partner-requests/${id}/reject`);
      setOk("Richiesta rifiutata ✅");
      await fetchRows();
    } catch (e) {
      console.error(e);
      const serverMsg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Errore rifiuto richiesta.";
      setError(serverMsg);
    } finally {
      setBusyId(null);
    }
  };

  const effectivePct =
    commissionOverride.trim() !== ""
      ? commissionOverride
      : String(TIER_DEFAULT[tier] ?? 10);

  return (
    <AdminLayout title="Richieste Partner">
      <div style={styles.wrap}>
        <div style={styles.topBar}>
          <div style={styles.filters}>
            <span style={styles.label}>Filtro stato</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <span style={{ ...styles.label, marginLeft: 8, opacity: 0.55 }}>
              (P:{counts.PENDING} A:{counts.APPROVED} R:{counts.REJECTED})
            </span>
          </div>

          <div style={styles.actions}>
            <button onClick={fetchRows} style={styles.btnSecondary}>
              Aggiorna
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              style={styles.btnGhost}
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {loading && <div style={styles.info}>Caricamento...</div>}
        {error && <div style={styles.err}>{error}</div>}
        {ok && <div style={styles.ok}>{ok}</div>}

        {!loading && rows.length === 0 && (
          <div style={styles.info}>Nessuna richiesta trovata.</div>
        )}

        {!loading &&
          rows.map((r) => (
            <div key={r.id} style={styles.card}>
              <div style={styles.rowTop}>
                <div>
                  <div style={styles.name}>{r.name || "—"}</div>
                  <div style={styles.meta}>
                    <span style={styles.badge}>{r.status}</span>
                    {r.partner_tier && (
                      <span style={styles.badgeSoft}>
                        Tier richiesto: {r.partner_tier}
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.id}>#{r.id}</div>
              </div>

              <div style={styles.line} />

              <div style={styles.grid}>
                <div>
                  <div style={styles.k}>Email</div>
                  <div style={styles.v}>{r.email || "—"}</div>
                </div>

                {r.created_at && (
                  <div>
                    <div style={styles.k}>Creato</div>
                    <div style={styles.v}>
                      {String(r.created_at).replace("T", " ").slice(0, 19)}
                    </div>
                  </div>
                )}
              </div>

              {/* Messaggio (notes) */}
              {r?.notes && (
                <div style={{ marginTop: 12 }}>
                  <div style={styles.k}>Messaggio</div>
                  <div style={styles.msgBox}>{r.notes}</div>
                </div>
              )}

              <div style={styles.buttons}>
                <button
                  disabled={r.status !== "PENDING" || busyId === r.id}
                  onClick={() => openApprove(r)}
                  style={styles.btnPrimary}
                >
                  {busyId === r.id ? "..." : "Approva"}
                </button>

                <button
                  disabled={r.status !== "PENDING" || busyId === r.id}
                  onClick={() => reject(r.id)}
                  style={styles.btnDanger}
                >
                  {busyId === r.id ? "..." : "Rifiuta"}
                </button>
              </div>
            </div>
          ))}

        {/* Approve Modal */}
        {approveOpen && (
          <div style={styles.modalOverlay} onClick={closeApprove}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalTitle}>Approva richiesta</div>
              <div style={styles.modalSub}>
                {approveReq?.name} — {approveReq?.email}
              </div>

              <div style={styles.modalRow}>
                <label style={styles.modalLabel}>Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  style={styles.modalSelect}
                >
                  <option value="BASE">BASE (10%)</option>
                  <option value="PRO">PRO (15%)</option>
                  <option value="ELITE">ELITE (20%)</option>
                </select>
              </div>

              <div style={styles.modalRow}>
                <label style={styles.modalLabel}>
                  Commissione override % (opz.)
                </label>
                <input
                  value={commissionOverride}
                  onChange={(e) => setCommissionOverride(e.target.value)}
                  placeholder={`Default: ${TIER_DEFAULT[tier]}%`}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.preview}>
                Commissione che verrà applicata: <b>{effectivePct}%</b>
              </div>

              <div style={styles.modalBtns}>
                <button onClick={closeApprove} style={styles.btnSecondary}>
                  Annulla
                </button>
                <button
                  onClick={approve}
                  style={styles.btnPrimary}
                  disabled={busyId === approveReq?.id}
                >
                  {busyId === approveReq?.id ? "..." : "Conferma + Invia email"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const styles = {
  wrap: { maxWidth: 920, margin: "0 auto", padding: "8px 10px 18px" },

  topBar: {
    display: "flex",
    gap: 12,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    flexWrap: "wrap",
  },

  filters: { display: "flex", alignItems: "center", gap: 10 },
  label: { fontSize: 12, opacity: 0.75 },
  select: {
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.bgDeep,
    color: colors.text,
    outline: "none",
  },

  actions: { display: "flex", gap: 10, alignItems: "center" },

  card: {
    background: colors.bg,
    borderRadius: 16,
    padding: 16,
    border: `1px solid ${colors.accentBorder}`,
    boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
    marginBottom: 12,
  },

  rowTop: { display: "flex", justifyContent: "space-between", gap: 10 },
  name: { fontSize: 16, fontWeight: 800 },
  id: { opacity: 0.6, fontSize: 12, marginTop: 2 },

  meta: { display: "flex", gap: 8, alignItems: "center", marginTop: 6 },
  badge: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.bgDeep,
  },
  badgeSoft: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: `1px solid rgba(253,197,0,0.25)`,
    background: "rgba(253,197,0,0.08)",
    color: colors.text,
  },

  line: { height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 0" },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  k: { fontSize: 12, opacity: 0.65 },
  v: { fontSize: 13, marginTop: 4 },

  msgBox: {
    marginTop: 6,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${colors.borderSoft}`,
    background: "rgba(255,255,255,0.03)",
    lineHeight: 1.35,
    fontSize: 13,
    opacity: 0.95,
    whiteSpace: "pre-wrap",
  },

  buttons: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },

  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    background: "linear-gradient(135deg, #FDC500, #FBBF24, #E2AA00)",
    color: "#1F2933",
    boxShadow: "0 12px 35px rgba(253,197,0,0.35)",
  },

  btnSecondary: {
    padding: "10px 14px",
    borderRadius: 999,
    border: `1px solid ${colors.borderSoft}`,
    cursor: "pointer",
    fontWeight: 700,
    background: colors.bgDeep,
    color: colors.text,
  },

  btnGhost: {
    padding: "10px 14px",
    borderRadius: 999,
    border: `1px solid rgba(253,197,0,0.25)`,
    cursor: "pointer",
    fontWeight: 700,
    background: "rgba(253,197,0,0.08)",
    color: colors.text,
  },

  btnDanger: {
    padding: "10px 14px",
    borderRadius: 999,
    border: `1px solid rgba(239,68,68,0.35)`,
    cursor: "pointer",
    fontWeight: 800,
    background: "rgba(239,68,68,0.12)",
    color: colors.text,
  },

  info: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${colors.borderSoft}`,
    marginBottom: 12,
    opacity: 0.85,
  },

  ok: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.25)",
    marginBottom: 12,
  },

  err: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.25)",
    marginBottom: 12,
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    zIndex: 9999,
  },
  modal: {
    width: "min(560px, 100%)",
    background: colors.bg,
    border: `1px solid ${colors.accentBorder}`,
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
  },
  modalTitle: { fontSize: 16, fontWeight: 900 },
  modalSub: { marginTop: 4, fontSize: 13, opacity: 0.75 },
  modalRow: { marginTop: 14, display: "grid", gap: 8 },
  modalLabel: { fontSize: 12, opacity: 0.75 },
  modalSelect: {
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.bgDeep,
    color: colors.text,
    outline: "none",
  },
  modalInput: {
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.bgDeep,
    color: colors.text,
    outline: "none",
  },
  preview: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    background: "rgba(253,197,0,0.06)",
    border: "1px solid rgba(253,197,0,0.18)",
    fontSize: 13,
  },
  modalBtns: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
};
