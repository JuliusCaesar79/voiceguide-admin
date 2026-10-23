import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";
import { ArrowLink, Button, Card, PageHeader, Pill, Stat, dateTime, eur, ui } from "../../components/admin/ui";

// Panoramica (restyle 2026-10): i numeri dell'ultima settimana, le cose da
// fare e gli ultimi movimenti. Ogni sezione si carica per conto suo: se una
// non risponde, le altre restano visibili.
const DAY = 24 * 60 * 60 * 1000;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState([]);
  const [orders, setOrders] = useState([]);
  const [freeTours, setFreeTours] = useState(null);
  const [pendingPartners, setPendingPartners] = useState(0);
  const [pendingTrials, setPendingTrials] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);

  async function load() {
    setLoading(true);
    const errors = [];
    const tasks = [
      apiClient.get("/admin/orders").then((r) => setOrders(Array.isArray(r.data?.items) ? r.data.items : [])).catch(() => errors.push("ordini")),
      apiClient.get("/admin/free-tours").then((r) => setFreeTours(r.data)).catch(() => errors.push("registrazioni")),
      apiClient
        .get("/admin/partner-requests", { params: { status: "PENDING" } })
        .then((r) => setPendingPartners(Array.isArray(r.data) ? r.data.length : 0))
        .catch(() => errors.push("richieste partner")),
      apiClient
        .get("/admin/trial-requests/count", { params: { status: "PENDING" } })
        .then((r) => setPendingTrials(Number(r.data?.count ?? 0)))
        .catch(() => errors.push("richieste prova")),
      apiClient
        .get("/admin/payouts/by-partner")
        .then((r) => setBalanceDue((Array.isArray(r.data) ? r.data : []).reduce((s, x) => s + (x.balance_due || 0), 0)))
        .catch(() => errors.push("commissioni")),
    ];
    await Promise.all(tasks);
    setFailed(errors);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const now = Date.now();
  const paid = orders.filter((o) => o.payment_status === "PAID");
  const inLast = (o, days) => o.created_at && now - new Date(o.created_at).getTime() <= days * DAY;
  const paid7 = paid.filter((o) => inLast(o, 7));
  const paid30 = paid.filter((o) => inLast(o, 30));
  const sum = (list) => list.reduce((s, o) => s + (o.total_amount || 0), 0);
  const ft = freeTours?.summary;

  const todo = [
    pendingPartners > 0 && { text: `${pendingPartners} ${pendingPartners === 1 ? "richiesta partner" : "richieste partner"} da valutare`, to: "/admin/partner-requests" },
    pendingTrials > 0 && { text: `${pendingTrials} ${pendingTrials === 1 ? "richiesta di prova" : "richieste di prova"} in attesa`, to: "/admin/trial-requests" },
    balanceDue > 0.005 && { text: `${eur(balanceDue)} di commissioni da pagare ai partner`, to: "/admin/payouts" },
  ].filter(Boolean);

  const today = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <PageHeader
          title="Panoramica"
          subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
          action={<Button onClick={load} disabled={loading}>{loading ? "Carico…" : "Aggiorna"}</Button>}
        />

        {failed.length ? <div style={ui.error}>Non ho potuto caricare: {failed.join(", ")}. Riprova con Aggiorna.</div> : null}

        <div style={ui.grid}>
          <Stat label="Incassi · 7 giorni" value={eur(sum(paid7))} hint={`${eur(sum(paid30))} negli ultimi 30`} accent />
          <Stat label="Ordini pagati · 7 giorni" value={paid7.length} hint={`${paid30.length} negli ultimi 30`} />
          <Stat label="Registrazioni · 7 giorni" value={ft ? ft.last_7_days : "—"} hint={ft ? `${ft.total} in totale` : null} />
          <Stat label="Tour gratuiti usati" value={ft ? ft.tours_used : "—"} hint={ft ? `${ft.registrants_who_used} registrati li hanno provati` : null} />
        </div>

        <Card title="Da fare" style={{ marginBottom: 18 }}>
          {todo.length === 0 ? (
            <p style={{ ...ui.muted, margin: 0 }}>{loading ? "Controllo…" : "Niente in sospeso. 🎉"}</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {todo.map((t) => (
                <li key={t.to} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderRadius: 14, background: "#FFF6DA", border: `1px solid ${colors.accentBorder}` }}>
                  <span style={{ fontWeight: 600 }}>{t.text}</span>
                  <ArrowLink to={t.to}>Apri</ArrowLink>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
          <Card title="Ultimi ordini" action={<ArrowLink to="/admin/orders">Tutti</ArrowLink>}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} style={rowStyle}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{o.buyer_email}</span>
                    <span style={ui.muted}>#{o.id} · {dateTime(o.created_at)}</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <b>{eur(o.total_amount)}</b>
                    <Pill tone={o.payment_status === "PAID" ? "good" : o.payment_status === "PENDING" ? "warn" : "bad"}>{statusLabel(o.payment_status)}</Pill>
                  </span>
                </li>
              ))}
              {!loading && orders.length === 0 ? <li style={ui.muted}>Ancora nessun ordine.</li> : null}
            </ul>
          </Card>

          <Card title="Ultime registrazioni" action={<ArrowLink to="/admin/free-tours">Tutte</ArrowLink>}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {(freeTours?.items || []).slice(0, 6).map((i) => (
                <li key={i.id} style={rowStyle}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{i.email}</span>
                    <span style={ui.muted}>{(i.language || "").toUpperCase()} · {dateTime(i.registered_at)}</span>
                  </span>
                  <Pill tone={i.used > 0 ? "good" : "neutral"}>usati {i.used}/{i.licenses.length || 3}</Pill>
                </li>
              ))}
              {!loading && !(freeTours?.items || []).length ? <li style={ui.muted}>Ancora nessuna registrazione.</li> : null}
            </ul>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function statusLabel(s) {
  return { PAID: "Pagato", PENDING: "In attesa", FAILED: "Fallito", REFUNDED: "Rimborsato" }[s] || s || "—";
}

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "11px 0",
  borderBottom: "1px solid rgba(20,22,27,0.08)",
};
