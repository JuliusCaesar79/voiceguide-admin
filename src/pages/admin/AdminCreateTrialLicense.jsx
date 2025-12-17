// src/pages/admin/AdminCreateTrialLicense.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

export default function AdminCreateTrialLicense() {
  const navigate = useNavigate();

  const [issuedToEmail, setIssuedToEmail] = useState("");
  const [licenseType, setLicenseType] = useState("SINGLE");
  const [maxGuests, setMaxGuests] = useState(10);
  const [durationHours, setDurationHours] = useState(24);
  const [notes, setNotes] = useState("Richiesta prova sito");
  const [sendEmail, setSendEmail] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [created, setCreated] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreated(null);

    if (!issuedToEmail.trim()) {
      setError("Inserisci un'email valida.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/admin/licenses/manual", {
        issued_to_email: issuedToEmail.trim(),
        license_type: licenseType,
        max_guests: Number(maxGuests),
        duration_hours: Number(durationHours),
        notes: notes?.trim() || null,
        send_email: Boolean(sendEmail),
      });

      setCreated(res.data);
      setSuccess("Licenza trial creata con successo.");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Richiesta fallita. Controlla i log del backend.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!created?.code) return;
    try {
      await navigator.clipboard.writeText(created.code);
      setSuccess("Codice copiato negli appunti.");
    } catch {
      setError("Impossibile copiare automaticamente. Copia manualmente il codice.");
    }
  }

  return (
    <AdminLayout>
      <div style={styles.wrap}>
        {/* Header pagina (coerente con dashboard) */}
        <div style={styles.headerCard}>
          <div>
            <h1 style={styles.h1}>Crea licenza Trial</h1>
            <p style={styles.subtitle}>
              Crea una licenza manuale/prova, sincronizzata con AirLink e inviata via email
              (se abilitato).
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={styles.secondaryBtn}
              disabled={loading}
            >
              Indietro
            </button>
          </div>
        </div>

        {/* Alert */}
        {error ? <div style={styles.alertError}>{error}</div> : null}
        {success ? <div style={styles.alertSuccess}>{success}</div> : null}

        <div style={styles.grid}>
          {/* Form */}
          <form onSubmit={onSubmit} style={styles.card}>
            <div style={styles.cardTitleRow}>
              <div style={styles.cardTitle}>Dettagli trial</div>
              <div style={styles.cardHint}>Solo Admin</div>
            </div>

            <label style={styles.label}>Email destinatario</label>
            <input
              value={issuedToEmail}
              onChange={(e) => setIssuedToEmail(e.target.value)}
              placeholder="cliente@example.com"
              style={styles.input}
              type="email"
            />

            <label style={styles.label}>Tipo licenza</label>
            <select
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
              style={styles.input}
            >
              <option value="SINGLE">SINGLE</option>
              <option value="TO">TO</option>
              <option value="SCHOOL">SCHOOL</option>
              <option value="MUSEUM">MUSEUM</option>
            </select>

            <label style={styles.label}>Numero massimo ospiti</label>
            <input
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              style={styles.input}
              type="number"
              min="1"
            />

            <label style={styles.label}>Finestra validità (ore)</label>
            <input
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              style={styles.input}
              type="number"
              min="1"
            />
            <div style={styles.miniHelp}>
              Nota: la validità qui è la “finestra trial”. Il tour in app dura sempre max 4 ore.
            </div>

            <label style={styles.label}>Note interne</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={styles.input}
              type="text"
            />

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
              <span style={{ marginLeft: 10 }}>
                Invia automaticamente email con il codice
              </span>
            </label>

            <div style={styles.actions}>
              <button type="submit" disabled={loading} style={styles.primaryBtn}>
                {loading ? "Creazione..." : "Crea licenza"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIssuedToEmail("");
                  setNotes("Richiesta prova sito");
                  setCreated(null);
                  setError("");
                  setSuccess("");
                }}
                disabled={loading}
                style={styles.secondaryBtn}
              >
                Reset
              </button>
            </div>
          </form>

          {/* Risultato */}
          <div style={styles.card}>
            <div style={styles.cardTitleRow}>
              <div style={styles.cardTitle}>Risultato</div>
              <div style={styles.cardHint}>Codice + dettagli</div>
            </div>

            {!created ? (
              <div style={styles.emptyState}>
                Nessuna licenza creata in questa sessione.
                <div style={styles.emptySub}>
                  Compila il form e premi “Crea licenza”.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={styles.kv}>
                  <div style={styles.k}>Codice</div>
                  <div style={styles.v}>
                    <span style={styles.codePill}>{created.code}</span>
                    <button type="button" onClick={copyCode} style={styles.copyBtn}>
                      Copia
                    </button>
                  </div>
                </div>

                <div style={styles.kv}>
                  <div style={styles.k}>Email</div>
                  <div style={styles.vText}>{created.issued_to_email}</div>
                </div>

                <div style={styles.kv}>
                  <div style={styles.k}>Tipo</div>
                  <div style={styles.vText}>{created.license_type}</div>
                </div>

                <div style={styles.kv}>
                  <div style={styles.k}>Max ospiti</div>
                  <div style={styles.vText}>{created.max_guests}</div>
                </div>

                <div style={styles.kv}>
                  <div style={styles.k}>Scadenza (trial)</div>
                  <div style={styles.vText}>{created.expires_at}</div>
                </div>

                <div style={styles.kv}>
                  <div style={styles.k}>Note</div>
                  <div style={styles.vText}>{created.notes || "-"}</div>
                </div>

                <div style={styles.tipBox}>
                  Suggerimento: questo codice è subito utilizzabile in app (AirLink). L’utente
                  dovrà inserirlo e attivarlo.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  wrap: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  headerCard: {
    background:
      "radial-gradient(circle at top left, rgba(253,197,0,0.06), transparent 55%), " +
      colors.card,
    borderRadius: 16,
    padding: "22px 26px",
    boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
    border: `1px solid ${colors.borderSoft}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  h1: { fontSize: "1.55rem", margin: 0, marginBottom: 6, color: colors.text },
  subtitle: { margin: 0, opacity: 0.82, color: colors.textSoft, maxWidth: 720 },

  headerActions: { display: "flex", gap: 10, flexWrap: "wrap" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
  },

  card: {
    background: colors.card,
    borderRadius: 16,
    padding: "18px 20px",
    boxShadow: "0 12px 35px rgba(0, 0, 0, 0.6)",
    border: `1px solid ${colors.borderSoft}`,
  },

  cardTitleRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: 700, color: colors.text, fontSize: "1rem" },
  cardHint: { fontSize: "0.78rem", opacity: 0.75, color: colors.textSoft },

  label: { display: "block", fontWeight: 700, marginTop: 12, marginBottom: 6, color: colors.text },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.borderStrong}`,
    outline: "none",
    fontSize: 14,
    background: colors.bgDeep,
    color: colors.text,
  },
  miniHelp: {
    marginTop: 8,
    fontSize: "0.8rem",
    opacity: 0.78,
    color: colors.textSoft,
  },

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    marginTop: 14,
    userSelect: "none",
    color: colors.textSoft,
    opacity: 0.95,
  },

  actions: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #FDC500, #FBBF24, #E2AA00)",
    color: "#1F2933",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(253,197,0,0.35)",
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: "999px",
    border: `1px solid ${colors.borderStrong}`,
    background: colors.bgDeep,
    color: colors.text,
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
  },

  alertError: {
    background: colors.card,
    borderRadius: 16,
    padding: "14px 18px",
    border: `1px solid ${colors.danger}`,
    color: colors.dangerSoft,
    fontSize: "0.9rem",
  },
  alertSuccess: {
    background: colors.card,
    borderRadius: 16,
    padding: "14px 18px",
    border: `1px solid ${colors.success}`,
    color: colors.successSoft,
    fontSize: "0.9rem",
  },

  emptyState: {
    padding: 16,
    borderRadius: 12,
    border: `1px dashed ${colors.borderStrong}`,
    background: colors.bgDeep,
    color: colors.textSoft,
    opacity: 0.9,
  },
  emptySub: { marginTop: 8, fontSize: "0.85rem", opacity: 0.85 },

  kv: {
    display: "grid",
    gridTemplateColumns: "170px 1fr",
    gap: 10,
    padding: "10px 0",
    borderBottom: `1px solid ${colors.borderSoft}`,
  },
  k: { color: colors.textSoft, fontWeight: 700, opacity: 0.9 },
  v: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  vText: { color: colors.text, opacity: 0.95 },

  codePill: {
    display: "inline-block",
    padding: "8px 10px",
    borderRadius: 12,
    border: `1px solid ${colors.accentBorder}`,
    background:
      "radial-gradient(circle at top left, rgba(253,197,0,0.14), transparent 55%), " +
      colors.bgDeep,
    color: colors.accent,
    fontWeight: 800,
    letterSpacing: 0.6,
  },
  copyBtn: {
    padding: "8px 10px",
    borderRadius: "999px",
    border: `1px solid ${colors.borderStrong}`,
    background: colors.bgDeep,
    color: colors.text,
    cursor: "pointer",
    fontWeight: 700,
  },

  tipBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${colors.accentBorder}`,
    background:
      "radial-gradient(circle at top left, rgba(253,197,0,0.10), transparent 55%), " +
      colors.bgDeep,
    color: colors.textSoft,
    opacity: 0.95,
    fontSize: "0.85rem",
  },
};
