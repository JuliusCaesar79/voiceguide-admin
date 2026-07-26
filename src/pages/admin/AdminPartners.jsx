import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";
import Modal from "../../components/admin/Modal";
import { modalButtonStyles, modalFieldStyles } from "../../components/admin/modalStyles";

const TIER_DEFAULT = { BASE: 10, PRO: 15, ELITE: 20 };

export default function AdminPartners() {
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [filter, setFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE

  // ---- Dialoghi personalizzati (al posto di prompt/confirm nativi) ----
  const [tierDialog, setTierDialog] = useState(null); // { partner, tier, commissionOverride }
  const [reasonDialog, setReasonDialog] = useState(null); // { partner, reason }
  const [reactivateDialog, setReactivateDialog] = useState(null); // { partner }
  const [tierError, setTierError] = useState("");

  const fetchPartners = async () => {
    setError("");
    setOk("");
    try {
      setLoading(true);

      const params = {};
      if (filter === "ACTIVE") params.active = true;
      if (filter === "INACTIVE") params.active = false;

      const res = await apiClient.get("/admin/partners", { params });
      setPartners(res.data || []);
    } catch (err) {
      console.error("Errore caricamento partner:", err);
      setError("Impossibile caricare i partner. Controlla il backend.");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const totals = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const p of partners) {
      if (p?.is_active) active += 1;
      else inactive += 1;
    }
    return { active, inactive, total: partners.length };
  }, [partners]);

  const formatDate = (v) => {
    if (!v) return "—";
    const s = String(v);
    // Se arriva ISO: 2025-12-21T12:34:56...
    if (s.includes("T")) return s.replace("T", " ").slice(0, 19);
    return s;
  };

  const apiErrorMsg = (e, fallback) =>
    e?.response?.data?.detail ||
    e?.response?.data?.message ||
    e?.message ||
    fallback;

  const onChangeTier = (partner) => {
    if (!partner?.id) return;
    setError("");
    setOk("");
    setTierError("");

    const currentTier = String(partner.partner_type || "BASE").toUpperCase();
    setTierDialog({
      partner,
      tier: TIER_DEFAULT[currentTier] ? currentTier : "BASE",
      commissionOverride: "",
    });
  };

  const closeTierDialog = () => {
    setTierDialog(null);
    setTierError("");
  };

  const submitTierChange = async () => {
    if (!tierDialog?.partner?.id) return;
    setTierError("");

    const newTier = tierDialog.tier;
    const params = { tier: newTier };

    if (tierDialog.commissionOverride.trim() !== "") {
      const val = Number(tierDialog.commissionOverride.replace(",", "."));
      if (Number.isNaN(val) || val < 0 || val > 100) {
        setTierError("Commissione non valida (0-100).");
        return;
      }
      params.commission_pct = val;
    }

    const partnerId = tierDialog.partner.id;
    setBusyId(partnerId);
    try {
      await apiClient.patch(`/admin/partners/${partnerId}/tier`, null, { params });
      setOk(`Tier aggiornato a ${newTier}.`);
      closeTierDialog();
      await fetchPartners();
    } catch (e) {
      console.error(e);
      setTierError(apiErrorMsg(e, "Errore aggiornamento tier."));
    } finally {
      setBusyId(null);
    }
  };

  const onToggleActive = (partner) => {
    if (!partner?.id) return;
    setError("");
    setOk("");

    if (partner.is_active) {
      setReasonDialog({ partner, reason: "" });
    } else {
      setReactivateDialog({ partner });
    }
  };

  const submitDeactivate = async () => {
    if (!reasonDialog?.partner?.id) return;
    const partner = reasonDialog.partner;

    setBusyId(partner.id);
    try {
      const params = { is_active: false };
      if (reasonDialog.reason) params.reason = reasonDialog.reason;

      await apiClient.patch(`/admin/partners/${partner.id}/active`, null, { params });

      setOk("Collaborazione chiusa.");
      setReasonDialog(null);
      await fetchPartners();
    } catch (e) {
      console.error(e);
      setError(apiErrorMsg(e, "Errore aggiornamento stato partner."));
    } finally {
      setBusyId(null);
    }
  };

  const submitReactivate = async () => {
    if (!reactivateDialog?.partner?.id) return;
    const partner = reactivateDialog.partner;

    setBusyId(partner.id);
    try {
      await apiClient.patch(`/admin/partners/${partner.id}/active`, null, {
        params: { is_active: true },
      });

      setOk("Partner riattivato.");
      setReactivateDialog(null);
      await fetchPartners();
    } catch (e) {
      console.error(e);
      setError(apiErrorMsg(e, "Errore aggiornamento stato partner."));
    } finally {
      setBusyId(null);
    }
  };

  const tierBadgeStyle = (tier) => {
    const t = String(tier || "BASE").toUpperCase();
    const base = {
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 999,
      border: `1px solid ${colors.borderSoft}`,
      background: colors.bgDeep,
      whiteSpace: "nowrap",
    };

    if (t === "PRO") {
      return {
        ...base,
        border: "1px solid rgba(59,130,246,0.35)",
        background: "rgba(59,130,246,0.10)",
      };
    }
    if (t === "ELITE") {
      return {
        ...base,
        border: "1px solid rgba(253,197,0,0.35)",
        background: "rgba(253,197,0,0.10)",
      };
    }
    return base;
  };

  const activeBadgeStyle = (isActive) => ({
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: isActive
      ? "1px solid rgba(34,197,94,0.30)"
      : "1px solid rgba(239,68,68,0.30)",
    background: isActive ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
    whiteSpace: "nowrap",
  });

  return (
    <AdminLayout title="Partner">
      <div style={styles.wrap}>
        <div style={styles.headerCard}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Partner</h1>
              <p style={styles.sub}>
                Gestione partner VoiceGuide AirLink: tier, commissioni, attivazione e chiusura collaborazione.
              </p>
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={styles.chip}>Tot: {totals.total}</span>
                <span style={styles.chipOk}>Attivi: {totals.active}</span>
                <span style={styles.chipWarn}>Disattivi: {totals.inactive}</span>
              </div>
            </div>

            <div style={styles.actions}>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={styles.select}
              >
                <option value="ALL">Tutti</option>
                <option value="ACTIVE">Solo attivi</option>
                <option value="INACTIVE">Solo disattivi</option>
              </select>

              <button onClick={fetchPartners} style={styles.btnSecondary}>
                Aggiorna
              </button>

              <button onClick={() => navigate("/admin/dashboard")} style={styles.btnGhost}>
                ← Dashboard
              </button>
            </div>
          </div>

          {loading && <div style={styles.info}>Caricamento partner...</div>}
          {error && <div style={styles.err}>{error}</div>}
          {ok && <div style={styles.ok}>{ok}</div>}
        </div>

        {!loading && !error && partners.length === 0 && (
          <div style={styles.info}>Nessun partner trovato.</div>
        )}

        {!loading && partners.length > 0 && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Tier</Th>
                  <Th>Commissione</Th>
                  <Th>Stato</Th>
                  <Th>Creato</Th>
                  <Th>Azioni</Th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => {
                  const t = String(p.partner_type || "BASE").toUpperCase();
                  return (
                    <tr key={p.id} style={styles.tr}>
                      <Td>{p.id}</Td>
                      <Td>{p.name}</Td>
                      <Td>{p.email}</Td>
                      <Td>
                        <span style={tierBadgeStyle(t)}>{t}</span>
                      </Td>
                      <Td>
                        {String(p.commission_pct ?? "—")}%{" "}
                        <span style={{ opacity: 0.6, fontSize: 12 }}>
                          (def {TIER_DEFAULT[t] ?? 10}%)
                        </span>
                      </Td>
                      <Td>
                        <span style={activeBadgeStyle(!!p.is_active)}>
                          {p.is_active ? "ATTIVO" : "DISATTIVO"}
                        </span>
                      </Td>
                      <Td>{formatDate(p.created_at)}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            style={styles.btnMini}
                            disabled={busyId === p.id}
                            onClick={() => onChangeTier(p)}
                            title="Promuovi / Declassa"
                          >
                            {busyId === p.id ? "..." : "Tier"}
                          </button>

                          <button
                            style={p.is_active ? styles.btnMiniDanger : styles.btnMiniOk}
                            disabled={busyId === p.id}
                            onClick={() => onToggleActive(p)}
                            title={p.is_active ? "Chiudi collaborazione" : "Riattiva partner"}
                          >
                            {busyId === p.id ? "..." : p.is_active ? "Disattiva" : "Riattiva"}
                          </button>

                          <button
                            style={styles.btnMiniGhost}
                            onClick={() => navigate(`/admin/partners/${p.id}`)}
                            title="Apri dettaglio"
                          >
                            Dettaglio →
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Dialogo cambio tier */}
        <Modal
          open={Boolean(tierDialog)}
          onClose={closeTierDialog}
          title="Modifica tier partner"
          subtitle={tierDialog?.partner ? `${tierDialog.partner.name} — ${tierDialog.partner.email}` : ""}
        >
          {tierDialog && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              <div>
                <label style={modalFieldStyles.label}>Tier</label>
                <select
                  value={tierDialog.tier}
                  onChange={(e) => setTierDialog({ ...tierDialog, tier: e.target.value })}
                  style={modalFieldStyles.input}
                >
                  <option value="BASE">BASE (10%)</option>
                  <option value="PRO">PRO (15%)</option>
                  <option value="ELITE">ELITE (20%)</option>
                </select>
              </div>

              <div>
                <label style={modalFieldStyles.label}>
                  Commissione override % (opzionale)
                </label>
                <input
                  value={tierDialog.commissionOverride}
                  onChange={(e) =>
                    setTierDialog({ ...tierDialog, commissionOverride: e.target.value })
                  }
                  placeholder={`Default: ${TIER_DEFAULT[tierDialog.tier]}%`}
                  style={modalFieldStyles.input}
                />
              </div>

              {tierError && (
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.dangerSoft }}>
                  {tierError}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button onClick={closeTierDialog} style={modalButtonStyles.secondary}>
                  Annulla
                </button>
                <button
                  onClick={submitTierChange}
                  style={modalButtonStyles.primary}
                  disabled={busyId === tierDialog.partner.id}
                >
                  {busyId === tierDialog.partner.id ? "..." : "Salva"}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Dialogo chiusura collaborazione */}
        <Modal
          open={Boolean(reasonDialog)}
          onClose={() => setReasonDialog(null)}
          title="Chiudi collaborazione"
          subtitle={reasonDialog?.partner ? `${reasonDialog.partner.name} — ${reasonDialog.partner.email}` : ""}
        >
          {reasonDialog && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
              <div>
                <label style={modalFieldStyles.label}>Motivo (opzionale)</label>
                <textarea
                  value={reasonDialog.reason}
                  onChange={(e) => setReasonDialog({ ...reasonDialog, reason: e.target.value })}
                  style={modalFieldStyles.textarea}
                  placeholder="Es. richiesta del partner, inattività, ecc."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button onClick={() => setReasonDialog(null)} style={modalButtonStyles.secondary}>
                  Annulla
                </button>
                <button
                  onClick={submitDeactivate}
                  style={modalButtonStyles.danger}
                  disabled={busyId === reasonDialog.partner.id}
                >
                  {busyId === reasonDialog.partner.id ? "..." : "Chiudi collaborazione"}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Dialogo riattivazione */}
        <Modal
          open={Boolean(reactivateDialog)}
          onClose={() => setReactivateDialog(null)}
          title="Riattiva partner"
          subtitle={
            reactivateDialog?.partner
              ? `Confermi la riattivazione di ${reactivateDialog.partner.name}?`
              : ""
          }
        >
          {reactivateDialog && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button onClick={() => setReactivateDialog(null)} style={modalButtonStyles.secondary}>
                Annulla
              </button>
              <button
                onClick={submitReactivate}
                style={modalButtonStyles.primary}
                disabled={busyId === reactivateDialog.partner.id}
              >
                {busyId === reactivateDialog.partner.id ? "..." : "Riattiva"}
              </button>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}

function Th({ children }) {
  return (
    <th style={styles.th}>
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td style={styles.td}>
      {children}
    </td>
  );
}

const styles = {
  wrap: { maxWidth: 1100, margin: "0 auto", padding: "10px 12px 22px" },

  headerCard: {
    background:
      "radial-gradient(circle at top left, rgba(253,197,0,0.06), transparent 55%), " +
      colors.card,
    borderRadius: 16,
    padding: "18px 18px",
    boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
    border: `1px solid ${colors.borderSoft}`,
    marginBottom: 12,
  },

  sub: {
    opacity: 0.82,
    fontSize: "0.92rem",
    marginTop: 6,
    color: colors.textSoft,
    marginBottom: 0,
  },

  chip: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.bgDeep,
    color: colors.text,
  },
  chipOk: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,0.30)",
    background: "rgba(34,197,94,0.10)",
    color: colors.text,
  },
  chipWarn: {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.30)",
    background: "rgba(239,68,68,0.10)",
    color: colors.text,
  },

  actions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },

  select: {
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.bgDeep,
    color: colors.text,
    outline: "none",
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

  btnMini: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    background: colors.accentGradient,
    color: colors.accentButtonText,
    boxShadow: "0 10px 28px rgba(253,197,0,0.25)",
    whiteSpace: "nowrap",
  },

  btnMiniDanger: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.35)",
    cursor: "pointer",
    fontWeight: 800,
    background: "rgba(239,68,68,0.12)",
    color: colors.text,
    whiteSpace: "nowrap",
  },

  btnMiniOk: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,0.30)",
    cursor: "pointer",
    fontWeight: 800,
    background: "rgba(34,197,94,0.10)",
    color: colors.text,
    whiteSpace: "nowrap",
  },

  btnMiniGhost: {
    padding: "8px 12px",
    borderRadius: 999,
    border: `1px solid ${colors.borderSoft}`,
    cursor: "pointer",
    fontWeight: 700,
    background: colors.bgDeep,
    color: colors.text,
    whiteSpace: "nowrap",
    opacity: 0.9,
  },

  info: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${colors.borderSoft}`,
    marginTop: 12,
    opacity: 0.9,
  },

  ok: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.25)",
    marginTop: 12,
  },

  err: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.25)",
    marginTop: 12,
  },

  tableWrap: {
    overflowX: "auto",
    background: colors.card,
    borderRadius: 16,
    border: `1px solid ${colors.borderSoft}`,
    boxShadow: "0 18px 45px rgba(0, 0, 0, 0.55)",
  },

  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },

  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: `1px solid ${colors.borderSoft}`,
    fontWeight: 700,
    fontSize: "0.8rem",
    color: colors.textSoft,
    whiteSpace: "nowrap",
  },

  td: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(30,41,59,0.8)",
    opacity: 0.92,
    color: colors.text,
    verticalAlign: "middle",
  },

  tr: {
    transition: "background 0.12s ease",
  },
};
