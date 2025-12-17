// src/pages/admin/AdminTrialRequests.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client"; // stesso pattern delle altre pagine

const colors = {
  bg: "#0b0b0b",
  card: "#111",
  text: "#fff",
  muted: "rgba(255,255,255,0.7)",
  border: "rgba(255,255,255,0.12)",
  accent: "#FDC500",
  danger: "#ff4d4f",
  ok: "#2ecc71",
};

export default function AdminTrialRequests() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("PENDING"); // PENDING | ISSUED | REJECTED
  const [q, setQ] = useState("");

  // Modali "leggeri"
  const [issuingId, setIssuingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // Payload issue
  const [issueForm, setIssueForm] = useState({
    license_type: "SINGLE",
    max_guests: 10,
    duration_hours: 24,
    notes: "",
    send_email: true,
  });

  // Reject
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/admin/trial-requests", {
        params: status ? { status } : {},
      });
      setRows(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.detail || "Errore caricamento richieste trial.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const hay = `${r.email || ""} ${r.name || ""} ${r.language || ""} ${r.message || ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q]);

  function openIssue(tr) {
    setError("");
    setIssuingId(tr.id);
    setIssueForm((prev) => ({
      ...prev,
      notes: prev.notes || (tr.message ? `Trial request: ${tr.message}` : "Trial request from website"),
      max_guests: prev.max_guests ?? 10,
      duration_hours: prev.duration_hours ?? 24,
      license_type: prev.license_type || "SINGLE",
      send_email: true,
    }));
  }

  async function doIssue() {
    if (!issuingId) return;
    setError("");
    try {
      const res = await apiClient.post(`/admin/trial-requests/${issuingId}/issue`, {
        license_type: issueForm.license_type,
        max_guests: Number(issueForm.max_guests),
        duration_hours: Number(issueForm.duration_hours),
        notes: issueForm.notes || null,
        send_email: !!issueForm.send_email,
      });

      // UX: mostra subito un alert con codice + scadenza
      const code = res?.data?.license_code;
      const exp = res?.data?.expires_at_iso;

      if (code) {
        try {
          await navigator.clipboard.writeText(code);
        } catch (_) {}
        alert(`✅ Trial emessa!\n\nCodice: ${code}\nScadenza: ${exp || "-"}\n\n(Codice copiato negli appunti se possibile)`);
      } else {
        alert("✅ Trial emessa!");
      }

      setIssuingId(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Errore emissione trial.");
    }
  }

  function openReject(tr) {
    setError("");
    setRejectingId(tr.id);
    setRejectReason("");
  }

  async function doReject() {
    if (!rejectingId) return;
    setError("");
    try {
      await apiClient.post(`/admin/trial-requests/${rejectingId}/reject`, {
        reason: rejectReason || null,
      });
      setRejectingId(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Errore rifiuto richiesta.");
    }
  }

  function formatDate(d) {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      return dt.toLocaleString();
    } catch {
      return d;
    }
  }

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Richieste Trial</h1>
            <p style={styles.subtitle}>
              Inbox richieste dal sito → Issue (AirLink + email) → stato aggiornato.
            </p>
          </div>

          <div style={styles.actions}>
            <button style={styles.btnGhost} onClick={() => navigate("/admin/licenses/trial")}>
              + Crea Trial Manuale
            </button>
            <button style={styles.btn} onClick={load}>
              Aggiorna
            </button>
          </div>
        </div>

        <div style={styles.controls}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>Stato</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.select}>
              <option value="PENDING">PENDING</option>
              <option value="ISSUED">ISSUED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div style={{ ...styles.controlGroup, flex: 1 }}>
            <label style={styles.label}>Cerca</label>
            <input
              style={styles.input}
              placeholder="email, nome, lingua, messaggio…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.card}>
          {loading ? (
            <div style={styles.muted}>Caricamento…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.muted}>Nessuna richiesta per questo filtro.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Nome</th>
                    <th style={styles.th}>Lingua</th>
                    <th style={styles.th}>Messaggio</th>
                    <th style={styles.thRight}>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} style={styles.tr}>
                      <td style={styles.td}>{formatDate(r.created_at)}</td>
                      <td style={styles.td}><strong>{r.email}</strong></td>
                      <td style={styles.td}>{r.name || "-"}</td>
                      <td style={styles.td}>{(r.language || "-").toUpperCase()}</td>
                      <td style={styles.td}>
                        <span style={styles.msg}>{r.message || "-"}</span>
                      </td>
                      <td style={styles.tdRight}>
                        {status === "PENDING" ? (
                          <div style={styles.rowBtns}>
                            <button style={styles.btnSmall} onClick={() => openIssue(r)}>
                              Issue
                            </button>
                            <button style={styles.btnSmallDanger} onClick={() => openReject(r)}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={styles.muted}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- Issue Modal --- */}
        {issuingId ? (
          <div style={styles.modalOverlay} onClick={() => setIssuingId(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>Emetti Trial</h3>

              <div style={styles.modalGrid}>
                <div style={styles.controlGroup}>
                  <label style={styles.label}>Tipo licenza</label>
                  <select
                    style={styles.select}
                    value={issueForm.license_type}
                    onChange={(e) => setIssueForm({ ...issueForm, license_type: e.target.value })}
                  >
                    <option value="SINGLE">SINGLE</option>
                    <option value="TO">TO</option>
                    <option value="SCHOOL">SCHOOL</option>
                    <option value="MUSEUM">MUSEUM</option>
                  </select>
                </div>

                <div style={styles.controlGroup}>
                  <label style={styles.label}>Max guests</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="1"
                    max="500"
                    value={issueForm.max_guests}
                    onChange={(e) => setIssueForm({ ...issueForm, max_guests: e.target.value })}
                  />
                </div>

                <div style={styles.controlGroup}>
                  <label style={styles.label}>Durata trial (ore)</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="1"
                    max="720"
                    value={issueForm.duration_hours}
                    onChange={(e) => setIssueForm({ ...issueForm, duration_hours: e.target.value })}
                  />
                </div>

                <div style={styles.controlGroupWide}>
                  <label style={styles.label}>Note (interne)</label>
                  <textarea
                    style={styles.textarea}
                    rows={4}
                    value={issueForm.notes}
                    onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                    placeholder="es. Trial request from website…"
                  />
                </div>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={!!issueForm.send_email}
                    onChange={(e) => setIssueForm({ ...issueForm, send_email: e.target.checked })}
                  />
                  <span style={{ marginLeft: 10 }}>Invia email con codice</span>
                </label>
              </div>

              <div style={styles.modalActions}>
                <button style={styles.btnGhost} onClick={() => setIssuingId(null)}>
                  Annulla
                </button>
                <button style={styles.btn} onClick={doIssue}>
                  Conferma Issue
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* --- Reject Modal --- */}
        {rejectingId ? (
          <div style={styles.modalOverlay} onClick={() => setRejectingId(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>Rifiuta richiesta</h3>

              <div style={styles.controlGroup}>
                <label style={styles.label}>Motivo (opzionale)</label>
                <textarea
                  style={styles.textarea}
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="es. richiesta incompleta, email errata…"
                />
              </div>

              <div style={styles.modalActions}>
                <button style={styles.btnGhost} onClick={() => setRejectingId(null)}>
                  Annulla
                </button>
                <button style={styles.btnDanger} onClick={doReject}>
                  Conferma Reject
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

const styles = {
  page: {
    padding: "28px 18px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  title: {
    margin: 0,
    color: colors.text,
    fontSize: 28,
    letterSpacing: 0.2,
  },
  subtitle: {
    margin: "6px 0 0",
    color: colors.muted,
    fontSize: 14,
    maxWidth: 760,
    lineHeight: 1.4,
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  controls: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 220,
  },
  controlGroupWide: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    gridColumn: "1 / -1",
  },
  label: {
    color: colors.muted,
    fontSize: 12,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.card,
    color: colors.text,
    outline: "none",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.card,
    color: colors.text,
    outline: "none",
    resize: "vertical",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.card,
    color: colors.text,
    outline: "none",
  },
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    padding: 14,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 980,
  },
  th: {
    textAlign: "left",
    color: colors.muted,
    fontSize: 12,
    padding: "10px 10px",
    borderBottom: `1px solid ${colors.border}`,
    fontWeight: 600,
  },
  thRight: {
    textAlign: "right",
    color: colors.muted,
    fontSize: 12,
    padding: "10px 10px",
    borderBottom: `1px solid ${colors.border}`,
    fontWeight: 600,
  },
  tr: {
    borderBottom: `1px solid ${colors.border}`,
  },
  td: {
    padding: "10px 10px",
    color: colors.text,
    fontSize: 13,
    verticalAlign: "top",
  },
  tdRight: {
    padding: "10px 10px",
    color: colors.text,
    fontSize: 13,
    verticalAlign: "top",
    textAlign: "right",
  },
  msg: {
    color: colors.muted,
    display: "inline-block",
    maxWidth: 520,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowBtns: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  btn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: colors.accent,
    color: "#000",
    fontWeight: 700,
    cursor: "pointer",
  },
  btnGhost: {
    padding: "10px 14px",
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: "transparent",
    color: colors.text,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSmall: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: colors.accent,
    color: "#000",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },
  btnSmallDanger: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: colors.danger,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },
  btnDanger: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: colors.danger,
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  error: {
    background: "rgba(255,77,79,0.12)",
    border: "1px solid rgba(255,77,79,0.35)",
    color: "#ffd1d1",
    padding: "10px 12px",
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 13,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 999,
  },
  modal: {
    width: "100%",
    maxWidth: 640,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
    padding: 16,
  },
  modalTitle: {
    margin: 0,
    color: colors.text,
    fontSize: 18,
  },
  modalGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  checkboxRow: {
    gridColumn: "1 / -1",
    display: "flex",
    alignItems: "center",
    color: colors.text,
    fontSize: 13,
    marginTop: 6,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
};
