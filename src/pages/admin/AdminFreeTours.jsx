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
      </div>

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
                  <td style={ui.td} colSpan={5}>
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
