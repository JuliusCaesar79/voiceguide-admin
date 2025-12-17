import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

export default function AdminPartnerRequests() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

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
      setError("Errore caricamento richieste partner (token o server non raggiungibile).");
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

  const approve = async (id) => {
    setError("");
    setOk("");
    const commissionPctRaw = window.prompt(
      "Commissione % (lascia vuoto per default in base al tier):",
      ""
    );

    setBusyId(id);
    try {
      const params = {};
      if (commissionPctRaw !== null && commissionPctRaw.trim() !== "") {
        const val = Number(commissionPctRaw.replace(",", "."));
        if (Number.isNaN(val) || val < 0 || val > 100) {
          throw new Error("Commissione non valida (0-100).");
        }
        params.commission_pct = val;
      }

      await apiClient.post(`/admin/partner-requests/${id}/approve`, null, { params });
      setOk("Richiesta approvata e partner creato ✅");
      await fetchRows();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Errore approvazione richiesta.");
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
      setError("Errore rifiuto richiesta.");
    } finally {
      setBusyId(null);
    }
  };

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
          </div>

          <div style={styles.actions}>
            <button onClick={fetchRows} style={styles.btnSecondary}>
              Aggiorna
            </button>
            <button onClick={() => navigate("/admin/dashboard")} style={styles.btnGhost}>
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
                    {r.partner_tier && <span style={styles.badgeSoft}>Tier: {r.partner_tier}</span>}
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

              <div style={styles.buttons}>
                <button
                  disabled={r.status !== "PENDING" || busyId === r.id}
                  onClick={() => approve(r.id)}
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
};
