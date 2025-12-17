// src/pages/admin/AdminPayouts.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

export default function AdminPayouts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiClient.get("/admin/payouts/by-partner");

      const data = Array.isArray(res.data) ? res.data : [];
      setRows(data);
    } catch (err) {
      console.error("Errore caricamento payouts by partner:", err);
      setError("Impossibile caricare il riepilogo payout per partner.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcoli riepilogo generale
  const totalGenerated = rows.reduce(
    (sum, r) => sum + (r.total_generated || 0),
    0
  );
  const totalPaid = rows.reduce((sum, r) => sum + (r.total_paid || 0), 0);
  const totalBalance = rows.reduce(
    (sum, r) => sum + (r.balance_due || 0),
    0
  );

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
        {/* Titolo pagina */}
        <div
          style={{
            background:
              "radial-gradient(circle at top left, rgba(253,197,0,0.06), transparent 55%), " +
              colors.card,
            borderRadius: "16px",
            padding: "22px 26px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            border: `1px solid ${colors.borderSoft}`,
          }}
        >
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Payout Partner</h1>
          <p
            style={{
              opacity: 0.82,
              fontSize: "0.9rem",
              marginTop: "6px",
              maxWidth: "600px",
              color: colors.textSoft,
            }}
          >
            Vista riepilogativa dei payout per ogni partner: totale generato
            dagli ordini, totale pagato e saldo residuo da corrispondere.
          </p>
        </div>

        {/* Card riepilogo generale */}
        <div
          style={{
            background: colors.bgDeep,
            borderRadius: "16px",
            padding: "18px 22px",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.6)",
            border: `1px solid ${colors.borderSoft}`,
            display: "flex",
            gap: "18px",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <SummaryTile
            label="Totale generato (ordini)"
            value={totalGenerated}
          />
          <SummaryTile label="Totale pagato" value={totalPaid} />
          <SummaryTile
            label="Saldo residuo complessivo"
            value={totalBalance}
          />
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

        {/* Tabella principale */}
        <div
          style={{
            background: colors.card,
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            border: `1px solid ${colors.borderSoft}`,
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                Riepilogo per partner
              </h2>
              <p
                style={{
                  opacity: 0.82,
                  fontSize: "0.9rem",
                  marginTop: "4px",
                  color: colors.textSoft,
                }}
              >
                Per ogni partner puoi vedere quanto ha generato, quanto è già
                stato pagato e il saldo residuo. Clicca su &quot;Vai al
                dettaglio&quot; per aprire la scheda partner e registrare nuovi
                payout.
              </p>
            </div>
          </div>

          {loading && <p>Caricamento riepilogo payout...</p>}

          {!loading && rows.length === 0 && !error && (
            <p
              style={{
                opacity: 0.8,
                fontSize: "0.9rem",
                color: colors.textSoft,
              }}
            >
              Nessun partner o nessun dato di payout ancora disponibile.
            </p>
          )}

          {!loading && rows.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr>
                    <Th>Partner</Th>
                    <Th>Referral</Th>
                    <Th>Totale generato</Th>
                    <Th>Totale pagato</Th>
                    <Th>Saldo da pagare</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.partner_id}>
                      <Td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>
                            {row.partner_name || "—"}
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              opacity: 0.7,
                              color: colors.textSoft,
                            }}
                          >
                            ID: {row.partner_id}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        {row.referral_code ? (
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                              padding: "2px 6px",
                              borderRadius: "999px",
                              background: colors.bg,
                              border: `1px solid ${colors.borderSoft}`,
                            }}
                          >
                            {row.referral_code}
                          </span>
                        ) : (
                          "—"
                        )}
                      </Td>
                      <Td>{formatEuro(row.total_generated)}</Td>
                      <Td>{formatEuro(row.total_paid)}</Td>
                      <Td
                        style={{
                          color:
                            (row.balance_due || 0) > 0
                              ? "#bef264"
                              : (row.balance_due || 0) < 0
                              ? "#fecaca"
                              : "#e5e7eb",
                          fontWeight: 600,
                        }}
                      >
                        {formatEuro(row.balance_due)}
                      </Td>
                      <Td>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/partners/${row.partner_id}`)
                          }
                          style={{
                            padding: "6px 12px",
                            borderRadius: "999px",
                            border: "none",
                            background:
                              "linear-gradient(135deg, #FDC500, #FBBF24, #E2AA00)",
                            color: "#1F2933",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: "0 10px 24px rgba(253,197,0,0.4)",
                          }}
                        >
                          Vai al dettaglio
                        </button>
                      </Td>
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

function SummaryTile({ label, value }) {
  return (
    <div
      style={{
        flex: "1 1 180px",
        minWidth: "180px",
        padding: "10px 12px",
        borderRadius: "12px",
        background:
          "radial-gradient(circle at top left, rgba(253,197,0,0.14), transparent 55%), " +
          colors.bg,
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
          fontSize: "1rem",
          fontWeight: 600,
          color: colors.accent,
        }}
      >
        {formatEuro(value)}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "8px 10px",
        borderBottom: `1px solid ${colors.borderSoft}`,
        fontWeight: 600,
        whiteSpace: "nowrap",
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
        verticalAlign: "top",
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
