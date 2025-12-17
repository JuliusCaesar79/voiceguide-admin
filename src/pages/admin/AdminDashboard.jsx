// src/pages/admin/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ordersSummary, setOrdersSummary] = useState({
    totalCount: 0,
    totalAmount: 0,
  });

  const [payoutsSummary, setPayoutsSummary] = useState({
    totalGenerated: 0,
    totalPaid: 0,
    totalBalance: 0,
  });

  const [partnersCount, setPartnersCount] = useState(0);
  const [pendingPartnerRequests, setPendingPartnerRequests] = useState(0);

  // ✅ NEW: Trial Requests pending
  const [pendingTrialRequests, setPendingTrialRequests] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1) Ordini
      try {
        const resOrders = await apiClient.get("/admin/orders");
        const data = resOrders.data || {};
        const items = Array.isArray(data.items) ? data.items : [];
        setOrdersSummary({
          totalCount: data.total_count || items.length || 0,
          totalAmount: data.total_amount || 0,
        });
      } catch (err) {
        console.warn("Errore caricamento riepilogo ordini:", err);
      }

      // 2) Payouts by partner
      try {
        const resPayouts = await apiClient.get("/admin/payouts/by-partner");
        const rows = Array.isArray(resPayouts.data) ? resPayouts.data : [];
        const totalGenerated = rows.reduce((sum, r) => sum + (r.total_generated || 0), 0);
        const totalPaid = rows.reduce((sum, r) => sum + (r.total_paid || 0), 0);
        const totalBalance = rows.reduce((sum, r) => sum + (r.balance_due || 0), 0);
        setPayoutsSummary({
          totalGenerated,
          totalPaid,
          totalBalance,
        });
      } catch (err) {
        console.warn("Errore caricamento riepilogo payouts:", err);
      }

      // 3) Partner
      try {
        const resPartners = await apiClient.get("/admin/partners");
        const items = Array.isArray(resPartners.data) ? resPartners.data : [];
        setPartnersCount(items.length);
      } catch (err) {
        console.warn("Errore caricamento partner:", err);
      }

      // 4) Partner Requests (PENDING)
      try {
        const resReq = await apiClient.get("/admin/partner-requests", {
          params: { status: "PENDING" },
        });
        const items = Array.isArray(resReq.data) ? resReq.data : [];
        setPendingPartnerRequests(items.length);
      } catch (err) {
        console.warn("Errore caricamento richieste partner:", err);
      }

      // ✅ 5) Trial Requests (PENDING) — via count endpoint
      try {
        const resTrialCount = await apiClient.get("/admin/trial-requests/count", {
          params: { status: "PENDING" },
        });
        const count = Number(resTrialCount?.data?.count ?? 0);
        setPendingTrialRequests(Number.isFinite(count) ? count : 0);
      } catch (err) {
        console.warn("Errore caricamento richieste trial:", err);
      }
    } catch (err) {
      console.error("Errore Dashboard Admin:", err);
      setError("Impossibile caricare il riepilogo generale dell'Impero.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        {/* Header */}
        <div
          style={{
            background:
              "radial-gradient(circle at top left, rgba(253,197,0,0.06), transparent 55%), " +
              colors.card,
            borderRadius: "16px",
            padding: "24px 30px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            border: `1px solid ${colors.borderSoft}`,
          }}
        >
          <h1 style={{ fontSize: "1.7rem", marginBottom: "0.3rem" }}>
            Benvenuto Console!
          </h1>
          <p
            style={{
              opacity: 0.82,
              fontSize: "0.95rem",
              maxWidth: "640px",
              color: colors.textSoft,
            }}
          >
            Questa è la cabina di regia dell&apos;Impero VoiceGuide: qui hai a colpo
            d&apos;occhio ordini, partner e stato dei payout verso i tuoi alleati.
          </p>
        </div>

        {/* Alert errore */}
        {error && (
          <div
            style={{
              background: colors.card,
              borderRadius: "16px",
              padding: "14px 18px",
              border: `1px solid ${colors.danger}`,
              color: colors.dangerSoft,
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Riepilogo principale - 5 tile */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
          }}
        >
          <StatCard
            label="Numero ordini"
            value={ordersSummary.totalCount}
            hint="Totale ordini registrati nel periodo corrente."
          />
          <StatCard
            label="Incassato totale"
            value={formatEuro(ordersSummary.totalAmount)}
            hint="Somma degli importi degli ordini."
          />
          <StatCard
            label="Partner attivi"
            value={partnersCount}
            hint="Numero di partner registrati nel sistema."
          />
          <StatCard
            label="Richieste partner (PENDING)"
            value={pendingPartnerRequests}
            hint="Richieste in attesa di approvazione o rifiuto."
          />
          {/* ✅ NEW */}
          <StatCard
            label="Richieste trial (PENDING)"
            value={pendingTrialRequests}
            hint="Richieste trial in attesa di emissione licenza."
          />
        </div>

        {/* Card riepilogo economico */}
        <div
          style={{
            background: colors.card,
            borderRadius: "16px",
            padding: "18px 22px",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.6)",
            border: `1px solid ${colors.borderSoft}`,
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.9rem",
              opacity: 0.9,
              maxWidth: "420px",
              color: colors.textSoft,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "4px", color: colors.text }}>
              Riepilogo economico partner
            </div>
            <div>
              Totale generato dagli ordini, totale già pagato e saldo residuo da
              corrispondere ai tuoi alleati.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <MiniBox
              label="Totale generato (ordini)"
              value={formatEuro(payoutsSummary.totalGenerated)}
            />
            <MiniBox label="Totale pagato" value={formatEuro(payoutsSummary.totalPaid)} />
            <MiniBox label="Saldo residuo" value={formatEuro(payoutsSummary.totalBalance)} />
          </div>
        </div>

        {/* Card scorciatoie */}
        <div
          style={{
            background: colors.card,
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            border: `1px solid ${colors.borderSoft}`,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <ShortcutCard
            title="Gestisci ordini"
            description="Visualizza l'elenco completo degli ordini e delle licenze acquistate."
            buttonLabel="Vai agli ordini"
            onClick={() => navigate("/admin/orders")}
          />

          {/* ✅ Trial license manual */}
          <ShortcutCard
            title="Create Trial License"
            description="Crea una licenza di prova/manuale e invia automaticamente il codice via email."
            buttonLabel="Crea trial"
            onClick={() => navigate("/admin/licenses/trial")}
          />

          {/* ✅ NEW: Trial Requests inbox */}
          <ShortcutCard
            title={`Richieste Trial${
              pendingTrialRequests > 0 ? ` (${pendingTrialRequests})` : ""
            }`}
            description="Inbox richieste trial dal sito: emetti la trial (AirLink+email) o rifiuta."
            buttonLabel="Vai alle richieste trial"
            onClick={() => navigate("/admin/trial-requests")}
          />

          <ShortcutCard
            title="Payout e commissioni"
            description="Controlla quanto hai già pagato ai partner e i saldi residui da corrispondere."
            buttonLabel="Vai ai payout"
            onClick={() => navigate("/admin/payouts")}
          />

          <ShortcutCard
            title={`Richieste partner${
              pendingPartnerRequests > 0 ? ` (${pendingPartnerRequests})` : ""
            }`}
            description="Approva o rifiuta le richieste: la promozione crea automaticamente il partner con referral."
            buttonLabel="Vai alle richieste"
            onClick={() => navigate("/admin/partner-requests")}
          />

          <ShortcutCard
            title="Partner VoiceGuide"
            description="Rivedi i tuoi partner, il loro referral e la relativa attività."
            buttonLabel="Vai ai partner"
            onClick={() => navigate("/admin/partners")}
          />
        </div>

        {loading && (
          <p
            style={{
              opacity: 0.7,
              fontSize: "0.85rem",
              marginTop: "6px",
            }}
          >
            Aggiornamento dati in corso...
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div
      style={{
        background: colors.card,
        borderRadius: "14px",
        padding: "14px 16px",
        boxShadow: "0 12px 35px rgba(0, 0, 0, 0.6)",
        border: `1px solid ${colors.borderStrong}`,
      }}
    >
      <div
        style={{
          fontSize: "0.8rem",
          opacity: 0.72,
          marginBottom: "4px",
          color: colors.textSoft,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          marginBottom: "4px",
          color: colors.accent,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontSize: "0.75rem",
            opacity: 0.65,
            color: colors.textSoft,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function MiniBox({ label, value }) {
  return (
    <div
      style={{
        minWidth: "160px",
        padding: "8px 10px",
        borderRadius: "10px",
        background:
          "radial-gradient(circle at top left, rgba(253,197,0,0.14), transparent 55%), " +
          colors.bgDeep,
        border: `1px solid ${colors.accentBorder}`,
      }}
    >
      <div
        style={{
          fontSize: "0.8rem",
          opacity: 0.78,
          marginBottom: "2px",
          color: colors.textSoft,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.95rem",
          fontWeight: 600,
          color: colors.accent,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ShortcutCard({ title, description, buttonLabel, onClick }) {
  return (
    <div
      style={{
        background: colors.bgDeep,
        borderRadius: "12px",
        padding: "14px 16px",
        border: `1px solid ${colors.borderStrong}`,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            marginBottom: "4px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            opacity: 0.8,
            color: colors.textSoft,
          }}
        >
          {description}
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        style={{
          marginTop: "10px",
          alignSelf: "flex-start",
          padding: "6px 12px",
          borderRadius: "999px",
          border: "none",
          background: "linear-gradient(135deg, #FDC500, #FBBF24, #E2AA00)",
          color: "#1F2933",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(253,197,0,0.35)",
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function formatEuro(value) {
  const num = typeof value === "number" ? value : Number(value || 0);
  return `${num.toFixed(2)} €`;
}
