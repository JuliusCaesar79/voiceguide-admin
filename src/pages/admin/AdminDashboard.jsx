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

  // ✅ partner counts (FIX DEFINITIVO)
  const [partnersActiveCount, setPartnersActiveCount] = useState(0);
  const [partnersInactiveCount, setPartnersInactiveCount] = useState(0);

  const [pendingPartnerRequests, setPendingPartnerRequests] = useState(0);
  const [pendingTrialRequestsequests, setPendingTrialRequests] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1) ORDINI
      try {
        const resOrders = await apiClient.get("/admin/orders");
        const data = resOrders.data || {};
        const items = Array.isArray(data.items) ? data.items : [];
        setOrdersSummary({
          totalCount: data.total_count || items.length || 0,
          totalAmount: data.total_amount || 0,
        });
      } catch (err) {
        console.warn("Errore caricamento ordini:", err);
      }

      // 2) PAYOUTS
      try {
        const resPayouts = await apiClient.get("/admin/payouts/by-partner");
        const rows = Array.isArray(resPayouts.data) ? resPayouts.data : [];
        const totalGenerated = rows.reduce((s, r) => s + (r.total_generated || 0), 0);
        const totalPaid = rows.reduce((s, r) => s + (r.total_paid || 0), 0);
        const totalBalance = rows.reduce((s, r) => s + (r.balance_due || 0), 0);
        setPayoutsSummary({ totalGenerated, totalPaid, totalBalance });
      } catch (err) {
        console.warn("Errore caricamento payouts:", err);
      }

      // ✅ 3) PARTNER COUNT (COUNT endpoint → DB-safe)
      try {
        const [resActive, resInactive] = await Promise.all([
          apiClient.get("/admin/partners/count", { params: { active: "true" } }),
          apiClient.get("/admin/partners/count", { params: { active: "false" } }),
        ]);

        setPartnersActiveCount(Number(resActive?.data?.count ?? 0));
        setPartnersInactiveCount(Number(resInactive?.data?.count ?? 0));
      } catch (err) {
        console.warn("Errore conteggio partner:", err);
      }

      // 4) PARTNER REQUESTS (PENDING)
      try {
        const resReq = await apiClient.get("/admin/partner-requests", {
          params: { status: "PENDING" },
        });
        const items = Array.isArray(resReq.data) ? resReq.data : [];
        setPendingPartnerRequests(items.length);
      } catch (err) {
        console.warn("Errore caricamento richieste partner:", err);
      }

      // 5) TRIAL REQUESTS (PENDING)
      try {
        const resTrialCount = await apiClient.get("/admin/trial-requests/count", {
          params: { status: "PENDING" },
        });
        setPendingTrialRequests(Number(resTrialCount?.data?.count ?? 0));
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
        {/* HEADER */}
        <div
          style={{
            background:
              "radial-gradient(circle at top left, rgba(253,197,0,0.06), transparent 55%), " +
              colors.card,
            borderRadius: "16px",
            padding: "24px 30px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            border: `1px solid ${colors.borderSoft}`,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
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

          <button
            type="button"
            onClick={fetchData}
            style={{
              padding: "10px 14px",
              borderRadius: "999px",
              border: `1px solid ${colors.borderSoft}`,
              background: colors.bgDeep,
              color: colors.text,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Aggiorna
          </button>
        </div>

        {/* TILE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
          }}
        >
          <StatCard label="Numero ordini" value={ordersSummary.totalCount} />
          <StatCard label="Incassato totale" value={formatEuro(ordersSummary.totalAmount)} />
          <StatCard label="Partner attivi" value={partnersActiveCount} />
          <StatCard label="Partner disattivi" value={partnersInactiveCount} />
          <StatCard label="Richieste partner (PENDING)" value={pendingPartnerRequests} />
          <StatCard label="Richieste trial (PENDING)" value={pendingTrialRequests} />
        </div>

        {/* ECONOMIA */}
        <div
          style={{
            background: colors.card,
            borderRadius: "16px",
            padding: "18px 22px",
            border: `1px solid ${colors.borderSoft}`,
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <MiniBox label="Totale generato" value={formatEuro(payoutsSummary.totalGenerated)} />
          <MiniBox label="Totale pagato" value={formatEuro(payoutsSummary.totalPaid)} />
          <MiniBox label="Saldo residuo" value={formatEuro(payoutsSummary.totalBalance)} />
        </div>

        {/* SHORTCUT */}
        <div
          style={{
            background: colors.card,
            borderRadius: "16px",
            padding: "20px 24px",
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
          <ShortcutCard
            title="Create Trial License"
            description="Crea una licenza di prova/manuale e invia automaticamente il codice via email."
            buttonLabel="Crea trial"
            onClick={() => navigate("/admin/licenses/trial")}
          />
          <ShortcutCard
            title="Richieste Trial"
            description="Inbox richieste trial dal sito."
            buttonLabel="Vai alle richieste trial"
            onClick={() => navigate("/admin/trial-requests")}
          />
          <ShortcutCard
            title="Payout e commissioni"
            description="Controlla i pagamenti e i saldi residui."
            buttonLabel="Vai ai payout"
            onClick={() => navigate("/admin/payouts")}
          />
          <ShortcutCard
            title="Richieste partner"
            description="Approva o rifiuta le richieste partner."
            buttonLabel="Vai alle richieste"
            onClick={() => navigate("/admin/partner-requests")}
          />
          <ShortcutCard
            title="Partner VoiceGuide"
            description="Rivedi i tuoi partner."
            buttonLabel="Vai ai partner"
            onClick={() => navigate("/admin/partners")}
          />
        </div>

        {loading && (
          <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>
            Aggiornamento dati in corso...
          </p>
        )}
      </div>
    </AdminLayout>
  );
}

/* ----------------- COMPONENTI UI ----------------- */

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: colors.card,
        borderRadius: "14px",
        padding: "14px 16px",
        border: `1px solid ${colors.borderStrong}`,
      }}
    >
      <div style={{ fontSize: "0.8rem", opacity: 0.72 }}>{label}</div>
      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: colors.accent }}>
        {value}
      </div>
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
        background: colors.bgDeep,
        border: `1px solid ${colors.accentBorder}`,
      }}
    >
      <div style={{ fontSize: "0.8rem", opacity: 0.78 }}>{label}</div>
      <div style={{ fontWeight: 600, color: colors.accent }}>{value}</div>
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
      }}
    >
      <div>
        <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>{description}</div>
      </div>
      <button
        onClick={onClick}
        style={{
          alignSelf: "flex-start",
          padding: "6px 12px",
          borderRadius: "999px",
          background: "linear-gradient(135deg, #FDC500, #FBBF24)",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
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
