import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { Button, Card, PageHeader, Pill, Stat, dateTime, ui } from "../../components/admin/ui";

// Registrazioni dal sito con i 3 tour gratuiti (5, 25, 35 ospiti):
// chi si è registrato e quanti tour ha davvero usato (dato letto da AirLink).
export default function AdminFreeTours() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/admin/free-tours");
      setData(res.data);
    } catch {
      setError("Non sono riuscito a caricare le registrazioni. Riprova con Aggiorna.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const s = data?.summary;
  const q = query.trim().toLowerCase();
  const items = (data?.items || []).filter((i) => !q || i.email.toLowerCase().includes(q));

  return (
    <AdminLayout>
      <PageHeader
        title="Registrazioni"
        subtitle="Chi si è registrato sul sito e ha ricevuto i 3 tour gratuiti."
        action={<Button onClick={load} disabled={loading}>{loading ? "Carico…" : "Aggiorna"}</Button>}
      />
      {error ? <div style={ui.error}>{error}</div> : null}
      {s && !s.airlink_status_available ? (
        <div style={ui.error}>AirLink non ha risposto: non vedo quali tour sono stati usati.</div>
      ) : null}

      <div style={ui.grid}>
        <Stat label="Registrati in totale" value={s ? s.total : "—"} accent />
        <Stat label="Ultimi 7 giorni" value={s ? s.last_7_days : "—"} hint={s ? `${s.last_30_days} negli ultimi 30` : null} />
        <Stat
          label="Hanno usato almeno un tour"
          value={s ? s.registrants_who_used : "—"}
          hint={s && s.total ? `${Math.round((s.registrants_who_used / s.total) * 100)}% dei registrati` : null}
        />
        <Stat label="Tour gratuiti usati" value={s ? s.tours_used : "—"} hint={s ? `su ${s.total * 3} regalati` : null} />
        <Stat label="Codice chiesto, non confermato" value={s ? s.codes_sent_not_confirmed : "—"} hint="email che non hanno finito" />
        <Stat
          label="Hanno poi comprato"
          value={s ? s.registrants_who_bought : "—"}
          hint={s ? `${euro(s.revenue_from_registrants)} incassati` : null}
        />
      </div>

      {s ? <Funnel s={s} /> : null}

      <Card
        title="Elenco"
        action={
          <input
            type="search"
            placeholder="Cerca email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minHeight: 40, padding: "0 14px", borderRadius: 999, border: "1px solid rgba(20,22,27,0.18)", background: "#FBF8F1", fontSize: 14, width: 220, maxWidth: "100%" }}
          />
        }
      >
        <div style={ui.scroll}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Email</th>
                <th style={ui.th}>Lingua</th>
                <th style={ui.th}>Registrato</th>
                <th style={ui.th}>Tour usati</th>
                <th style={ui.th}>Acquisti</th>
                <th style={ui.th}>Codici</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td style={{ ...ui.td, fontWeight: 600 }}>{i.email}</td>
                  <td style={ui.td}>{(i.language || "").toUpperCase()}</td>
                  <td style={{ ...ui.td, whiteSpace: "nowrap" }}>{dateTime(i.registered_at)}</td>
                  <td style={ui.td}>
                    <Pill tone={i.used > 0 ? "good" : "neutral"}>{i.used}/{i.licenses.length || 3}</Pill>
                  </td>
                  <td style={{ ...ui.td, whiteSpace: "nowrap" }}>
                    {i.orders_paid > 0 ? <Pill tone="good">{i.orders_paid} · {euro(i.spent)}</Pill> : <span style={ui.muted}>—</span>}
                  </td>
                  <td style={ui.td}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {i.licenses.map((l) => (
                        <span key={l.code} style={{ ...ui.muted, whiteSpace: "nowrap" }}>
                          <b style={{ fontFamily: "monospace", color: "#14161B" }}>{l.code}</b> · {l.max_guests} ospiti ·{" "}
                          {l.activated_at ? `usato ${dateTime(l.activated_at)}` : "non ancora usato"}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 ? (
                <tr>
                  <td style={ui.td} colSpan={6}>
                    <span style={ui.muted}>{q ? "Nessuna email trovata." : "Ancora nessuna registrazione."}</span>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}

function euro(n) {
  return `€${Number(n || 0).toFixed(2).replace(".", ",")}`;
}

// Percorso dalla registrazione all'acquisto: barre proporzionali e % rispetto
// al passo precedente, per vedere dove si perdono le persone.
function Funnel({ s }) {
  const steps = [
    { label: "Hanno chiesto il codice", value: s.total + s.codes_sent_not_confirmed },
    { label: "Hanno confermato l'email", value: s.total },
    { label: "Hanno usato almeno un tour", value: s.registrants_who_used },
    { label: "Hanno comprato", value: s.registrants_who_bought },
  ];
  const max = steps[0].value || 1;
  return (
    <Card title="Percorso: dalla registrazione all'acquisto" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((step, i) => {
          const prev = i > 0 ? steps[i - 1].value : null;
          return (
            <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ width: 210, fontSize: 14, fontWeight: 600 }}>{step.label}</span>
              <div style={{ flex: "1 1 200px", height: 14, background: "#F1EBDD", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${(step.value / max) * 100}%`, height: "100%", background: "#FFC226", borderRadius: 999 }} />
              </div>
              <span style={{ width: 120, fontSize: 14, fontWeight: 700, textAlign: "right" }}>
                {step.value}
                {prev ? <span style={ui.muted}> · {Math.round((step.value / prev) * 100)}%</span> : null}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
