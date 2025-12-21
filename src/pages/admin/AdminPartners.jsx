import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

const TIER_DEFAULT = { BASE: 10, PRO: 15, ELITE: 20 };

export default function AdminPartners() {
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [filter, setFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE

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

  const onChangeTier = async (partner) => {
    if (!partner?.id) return;
    setError("");
    setOk("");

    const currentTier = String(partner.partner_type || "BASE").toUpperCase();

    const newTierRaw = window.prompt(
      "Imposta nuovo tier (BASE / PRO / ELITE):",
      currentTier
    );
    if (newTierRaw === null) return;

    const newTier = String(newTierRaw).trim().toUpperCase();
    if (!TIER_DEFAULT[newTier]) {
      setError("Tier non valido. Usa BASE, PRO o ELITE.");
      return;
    }

    const overrideRaw = window.prompt(
      `Commissione override % (vuoto = default ${TIER_DEFAULT[newTier]}%):`,
      ""
    );
    if (overrideRaw === null) return;

    const params = { tier: newTier };
    if (overrideRaw.trim() !== "") {
      const val = Number(overrideRaw.replace(",", "."));
      if (Number.isNaN(val) || val < 0 || val > 100) {
        setError("Commissione non valida (0-100).");
        return;
      }
      params.commission_pct = val;
    }

    setBusyId(partner.id);
    try {
      await apiClient.patch(`/admin/partners/${partner.id}/tier`, null, { params });
      setOk(`Tier aggiornato a ${newTier} ✅`);
      await fetchPartners();
    } catch (e) {
      console.error(e);
      setError(apiErrorMsg(e, "Errore aggiornamento tier."));
    } finally {
      setBusyId(null);
    }
  };

  const onToggleActive = async (partner) => {
    if (!partner?.id) return;
    setError("");
    setOk("");

    const next = !partner.is_active;

    let reason = "";
    if (!next) {
      const reasonRaw = window.prompt(
        "Motivo chiusura collaborazione (opzionale):",
        ""
      );
      if (reasonRaw === null) return; // cancel
      reason = reasonRaw;
    } else {
      const sure = window.confirm("Confermi la RIATTIVAZIONE del partner?");
      if (!sure) return;
    }

    setBusyId(partner.id);
    try {
      const params = { is_active: next };
      if (reason && !next) params.reason = reason;

      await apiClient.patch(`/admin/partners/${partner.id}/active`, null, { params });

      setOk(next ? "Partner riattivato ✅" : "Collaborazione chiusa ✅");
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
    background: "linear-gradient(135deg, #FDC500, #FBBF24, #E2AA00)",
    color: "#1F2933",
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
