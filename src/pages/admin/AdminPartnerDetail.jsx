// src/pages/admin/AdminPartnerDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

export default function AdminPartnerDetail() {
  const { id } = useParams();

  const [partner, setPartner] = useState(null);

  // Commissioni per ordine (PartnerPayout)
  const [payouts, setPayouts] = useState([]);
  // Pagamenti reali (PartnerPayment)
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Stato form "Registra commissione per ordine" ---
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [payoutNote, setPayoutNote] = useState("");

  // --- Stato form "Registra pagamento reale" ---
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // --- copia negli appunti (per referral, email, ecc.) ---
  const copyToClipboard = async (text) => {
    try {
      if (!text) return;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback vecchio stile
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setSubmitSuccess("Copiato negli appunti ✅");
      setTimeout(() => setSubmitSuccess(""), 1400);
    } catch (e) {
      console.warn("Impossibile copiare negli appunti:", e);
      setSubmitError("Impossibile copiare negli appunti.");
      setTimeout(() => setSubmitError(""), 1800);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Dettaglio partner
      const partnerRes = await apiClient.get(`/admin/partners/${id}`);
      setPartner(partnerRes.data);

      // Commissioni per ordine (payouts)
      try {
        const payoutsRes = await apiClient.get(`/admin/payouts/${id}`);
        const data = payoutsRes.data;

        let normalized = [];
        if (Array.isArray(data)) normalized = data;
        else if (data && typeof data === "object") normalized = [data];
        else normalized = [];

        setPayouts(normalized);
      } catch (innerErr) {
        console.warn("Errore caricamento commissioni (payouts):", innerErr);
        setPayouts([]);
      }

      // Pagamenti reali (payments) ✅ ENDPOINT CORRETTO
      try {
        const payRes = await apiClient.get(`/admin/partner-payments/${id}`);
        const data = payRes.data;

        let normalized = [];
        if (Array.isArray(data)) normalized = data;
        else if (data && typeof data === "object") normalized = [data];
        else normalized = [];

        setPayments(normalized);
      } catch (innerErr) {
        console.warn("Errore caricamento pagamenti reali:", innerErr);
        setPayments([]);
      }
    } catch (err) {
      console.error("Errore caricamento dettaglio partner:", err);
      setError("Impossibile caricare il dettaglio partner o i dati economici.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const totalCommissioni = Array.isArray(payouts)
    ? payouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    : 0;

  const totalPagamenti = Array.isArray(payments)
    ? payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    : 0;

  const saldoResiduo = totalCommissioni - totalPagamenti;

  // --- Handler: registra commissione per ordine (payout) ---
  const handleCreatePayout = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const numericOrderId = orderId ? Number(orderId) : null;

    if (!numericOrderId || numericOrderId <= 0) {
      setSubmitError("Inserisci un ID ordine valido (numero intero).");
      return;
    }

    try {
      setSubmitLoading(true);

      // amount non serve più (backend lo ignora e calcola da solo)
      const payload = {
        partner_id: Number(id),
        order_id: numericOrderId,
        amount: 0, // compat
        note: payoutNote || null,
      };

      await apiClient.post("/admin/payouts/create", payload);

      setSubmitSuccess(
        "Commissione registrata con successo (calcolata automaticamente)."
      );
      setOrderId("");
      setPayoutNote("");
      await fetchData();
    } catch (err) {
      console.error("Errore creazione commissione payout:", err);
      const msg =
        err?.response?.data?.detail ||
        "Impossibile registrare la commissione. Controlla i dati (ordine/partner).";
      setSubmitError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- Handler: registra pagamento reale ---
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const numericAmount = Number(paymentAmount);

    if (!numericAmount || numericAmount <= 0) {
      setSubmitError("Inserisci un importo valido maggiore di zero.");
      return;
    }

    try {
      setSubmitLoading(true);

      const payload = {
        partner_id: Number(id),
        amount: numericAmount,
        note: paymentNote || null,
      };

      // ✅ ENDPOINT CORRETTO
      await apiClient.post("/admin/partner-payments/create", payload);

      setSubmitSuccess("Pagamento reale registrato con successo.");
      setPaymentAmount("");
      setPaymentNote("");
      await fetchData();
    } catch (err) {
      console.error("Errore creazione pagamento reale:", err);
      const msg =
        err?.response?.data?.detail ||
        "Impossibile registrare il pagamento. Controlla i dati.";
      setSubmitError(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const referralCode =
    partner?.referral_code ||
    partner?.referralCode ||
    partner?.code ||
    partner?.referral ||
    "";

  return (
    <AdminLayout>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Alert errore */}
        {error && (
          <div
            style={{
              background: colors.card,
              borderRadius: "16px",
              padding: "16px 20px",
              border: `1px solid ${colors.danger}`,
              color: colors.dangerSoft,
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Card info partner */}
        <div
          style={{
            background:
              "radial-gradient(circle at top left, rgba(253,197,0,0.06), transparent 55%), " +
              colors.card,
            borderRadius: "16px",
            padding: "24px 28px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            border: `1px solid ${colors.borderSoft}`,
          }}
        >
          {loading && <p>Caricamento dati partner...</p>}

          {!loading && !error && partner && (
            <>
              <h1 style={{ fontSize: "1.6rem", margin: 0 }}>
                {partner.name} (ID: {partner.id})
              </h1>
              <p
                style={{
                  opacity: 0.82,
                  fontSize: "0.9rem",
                  marginTop: "4px",
                  marginBottom: "12px",
                  color: colors.textSoft,
                }}
              >
                Email: {partner.email} | Commissione: {partner.commission_pct}%
              </p>

              {/* ✅ Referral code (visibile + copia) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                }}
              >
                <div style={{ opacity: 0.72, color: colors.textSoft, fontSize: "0.85rem" }}>
                  Referral code
                </div>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    border: `1px solid ${colors.accentBorder}`,
                    background:
                      "radial-gradient(circle at top left, rgba(253,197,0,0.16), transparent 60%), " +
                      colors.bgDeep,
                    color: colors.accent,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    fontSize: "0.85rem",
                  }}
                >
                  {referralCode || "—"}
                </div>

                <button
                  type="button"
                  disabled={!referralCode}
                  onClick={() => copyToClipboard(referralCode)}
                  style={{
                    ...pillButtonStyle,
                    marginTop: 0,
                    opacity: referralCode ? 1 : 0.55,
                    cursor: referralCode ? "pointer" : "default",
                  }}
                  title={referralCode ? "Copia referral code" : "Referral code non disponibile"}
                >
                  📋 Copia
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(partner.email)}
                  style={{ ...pillButtonStyle, marginTop: 0 }}
                  title="Copia email"
                >
                  📩 Copia email
                </button>
              </div>

              {/* ✅ Summary calcolato davvero: maturato vs pagamenti reali */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  fontSize: "0.9rem",
                  opacity: 0.9,
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ opacity: 0.65, color: colors.textSoft }}>
                    Creato il
                  </div>
                  <div>{partner.created_at}</div>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <SmallStat
                    label="Totale commissioni (maturate)"
                    value={formatEuro(totalCommissioni)}
                  />
                  <SmallStat
                    label="Totale pagamenti reali"
                    value={formatEuro(totalPagamenti)}
                  />
                  <SmallStat label="Saldo residuo" value={formatEuro(saldoResiduo)} />
                </div>
              </div>

              {/* messaggi submit (anche per copia) */}
              {(submitError || submitSuccess) && (
                <div style={{ marginTop: "12px" }}>
                  {submitError && (
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.dangerSoft }}>
                      {submitError}
                    </p>
                  )}
                  {submitSuccess && (
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.success }}>
                      {submitSuccess}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {!loading && !error && !partner && (
            <p
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                color: colors.textSoft,
              }}
            >
              Partner non trovato.
            </p>
          )}
        </div>

        {/* CARD COMMISSIONI (per ordine) */}
        <div
          style={{
            background: colors.card,
            borderRadius: "16px",
            padding: "24px 28px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            border: `1px solid ${colors.borderSoft}`,
          }}
        >
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Commissioni (per ordine)</h2>
              <p
                style={{
                  opacity: 0.82,
                  fontSize: "0.9rem",
                  marginTop: "4px",
                  color: colors.textSoft,
                }}
              >
                Qui vedi le commissioni maturate per ciascun ordine (calcolate automaticamente).
              </p>
            </div>

            <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
              <div style={{ opacity: 0.7, color: colors.textSoft }}>
                Totale commissioni (storico)
              </div>
              <div style={{ fontWeight: 600, color: colors.accent }}>
                {formatEuro(totalCommissioni)}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPayoutForm((prev) => !prev);
                  setSubmitError("");
                  setSubmitSuccess("");
                }}
                style={pillButtonStyle}
              >
                {showPayoutForm ? "Chiudi form commissione" : "Registra commissione ordine"}
              </button>
            </div>
          </div>

          {showPayoutForm && (
            <form onSubmit={handleCreatePayout} style={formStyle}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: "1 1 140px", minWidth: "180px" }}>
                  <label style={labelStyle}>ID Ordine</label>
                  <input
                    type="number"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    style={inputStyle}
                    placeholder="Es. 123"
                  />
                  <div style={hintStyle}>
                    L’importo viene calcolato automaticamente (totale ordine × % partner).
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Nota (opzionale)</label>
                <textarea
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  style={{
                    ...inputStyle,
                    minHeight: "60px",
                    resize: "vertical",
                    borderRadius: "12px",
                  }}
                  placeholder="Es. Commissione su ordine #123"
                />
              </div>

              {submitError && (
                <p style={{ margin: 0, fontSize: "0.8rem", color: colors.dangerSoft }}>
                  {submitError}
                </p>
              )}
              {submitSuccess && (
                <p style={{ margin: 0, fontSize: "0.8rem", color: colors.success }}>
                  {submitSuccess}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                <button
                  type="submit"
                  disabled={submitLoading}
                  style={saveButtonStyle(submitLoading)}
                >
                  {submitLoading ? "Registrazione..." : "Salva commissione"}
                </button>
              </div>
            </form>
          )}

          {loading && <p>Caricamento commissioni...</p>}

          {!loading && Array.isArray(payouts) && payouts.length === 0 && (
            <p style={{ opacity: 0.8, fontSize: "0.9rem", color: colors.textSoft }}>
              Nessuna commissione registrata per questo partner.
            </p>
          )}

          {!loading && Array.isArray(payouts) && payouts.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Ordine</Th>
                    <Th>Importo</Th>
                    <Th>Creato il</Th>
                    <Th>Note</Th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <Td>{p.id}</Td>
                      <Td>{p.order_id}</Td>
                      <Td>{formatEuro(p.amount)}</Td>
                      <Td>{p.created_at}</Td>
                      <Td>{p.note || "-"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CARD PAGAMENTI REALI */}
        <div
          style={{
            background: colors.card,
            borderRadius: "16px",
            padding: "24px 28px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            border: `1px solid ${colors.borderSoft}`,
          }}
        >
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                Pagamenti reali (bonifici / saldi)
              </h2>
              <p
                style={{
                  opacity: 0.82,
                  fontSize: "0.9rem",
                  marginTop: "4px",
                  color: colors.textSoft,
                }}
              >
                Qui registri i pagamenti effettivamente effettuati al partner (non legati a singoli
                ordini).
              </p>
            </div>

            <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
              <div style={{ opacity: 0.7, color: colors.textSoft }}>
                Totale pagamenti reali
              </div>
              <div style={{ fontWeight: 600, color: colors.accent }}>
                {formatEuro(totalPagamenti)}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPaymentForm((prev) => !prev);
                  setSubmitError("");
                  setSubmitSuccess("");
                }}
                style={pillButtonStyle}
              >
                {showPaymentForm ? "Chiudi form pagamento" : "Registra pagamento reale"}
              </button>
            </div>
          </div>

          {showPaymentForm && (
            <form onSubmit={handleCreatePayment} style={formStyle}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: "1 1 140px", minWidth: "180px" }}>
                  <label style={labelStyle}>Importo (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    style={inputStyle}
                    placeholder="Es. 47.22"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Nota (opzionale)</label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  style={{
                    ...inputStyle,
                    minHeight: "60px",
                    resize: "vertical",
                    borderRadius: "12px",
                  }}
                  placeholder="Es. Bonifico mensile / saldo commissioni novembre"
                />
              </div>

              {submitError && (
                <p style={{ margin: 0, fontSize: "0.8rem", color: colors.dangerSoft }}>
                  {submitError}
                </p>
              )}
              {submitSuccess && (
                <p style={{ margin: 0, fontSize: "0.8rem", color: colors.success }}>
                  {submitSuccess}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                <button
                  type="submit"
                  disabled={submitLoading}
                  style={saveButtonStyle(submitLoading)}
                >
                  {submitLoading ? "Registrazione..." : "Salva pagamento"}
                </button>
              </div>
            </form>
          )}

          {loading && <p>Caricamento pagamenti...</p>}

          {!loading && Array.isArray(payments) && payments.length === 0 && (
            <p style={{ opacity: 0.8, fontSize: "0.9rem", color: colors.textSoft }}>
              Nessun pagamento reale registrato per questo partner.
            </p>
          )}

          {!loading && Array.isArray(payments) && payments.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Importo</Th>
                    <Th>Creato il</Th>
                    <Th>Note</Th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <Td>{p.id}</Td>
                      <Td>{formatEuro(p.amount)}</Td>
                      <Td>{p.created_at}</Td>
                      <Td>{p.note || "-"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function SmallStat({ label, value }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        borderRadius: "10px",
        background:
          "radial-gradient(circle at top left, rgba(253,197,0,0.14), transparent 55%), " +
          colors.bg,
        border: `1px solid ${colors.accentBorder}`,
        fontSize: "0.8rem",
      }}
    >
      <div style={{ opacity: 0.78, marginBottom: "2px", color: colors.textSoft }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, color: colors.accent }}>{value}</div>
    </div>
  );
}

const pillButtonStyle = {
  marginTop: "10px",
  padding: "6px 12px",
  borderRadius: "999px",
  border: "none",
  background: "linear-gradient(135deg, #FDC500, #FBBF24, #E2AA00)",
  color: "#1F2933",
  fontSize: "0.8rem",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(253,197,0,0.4)",
};

const formStyle = {
  marginBottom: "18px",
  padding: "14px 16px",
  borderRadius: "12px",
  background: colors.bgDeep,
  border: `1px solid ${colors.borderSoft}`,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  opacity: 0.8,
  marginBottom: "2px",
  color: colors.textSoft,
};

const hintStyle = {
  marginTop: "6px",
  fontSize: "0.75rem",
  opacity: 0.75,
  color: colors.textSoft,
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "999px",
  border: `1px solid ${colors.borderSoft}`,
  background: colors.bg,
  color: colors.text,
  fontSize: "0.85rem",
  outline: "none",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.9rem",
};

function saveButtonStyle(disabled) {
  return {
    padding: "8px 16px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #4ade80, #a3e635)",
    color: "#020617",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.7 : 1,
    boxShadow: "0 10px 26px rgba(34,197,94,0.4)",
  };
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "8px 10px",
        borderBottom: `1px solid ${colors.borderSoft}`,
        fontWeight: 600,
        fontSize: "0.8rem",
        color: colors.textSoft,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td
      style={{
        padding: "8px 10px",
        borderBottom: "1px solid rgba(30,41,59,0.8)",
        opacity: 0.9,
        color: colors.text,
      }}
    >
      {children}
    </td>
  );
}

function formatEuro(value) {
  const num = typeof value === "number" ? value : Number(value || 0);
  return `${num.toFixed(2)} €`;
}
