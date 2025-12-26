// src/pages/admin/AdminOrders.jsx

import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalCount: 0,
    totalAmount: 0,
    totalEstimatedAgoraCost: 0,
    totalMargin: 0,
    fromDate: null,
    toDate: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiClient.get("/admin/orders");
      const data = res.data || {};
      const items = Array.isArray(data.items) ? data.items : [];

      setOrders(items);
      setSummary({
        totalCount: data.total_count || items.length || 0,
        totalAmount: data.total_amount || 0,
        totalEstimatedAgoraCost: data.total_estimated_agora_cost || 0,
        totalMargin: data.total_margin || 0,
        fromDate: data.from_date || null,
        toDate: data.to_date || null,
      });
    } catch (err) {
      console.error("Errore caricamento ordini admin:", err);
      setError("Impossibile caricare l'elenco ordini.");
      setOrders([]);
      setSummary({
        totalCount: 0,
        totalAmount: 0,
        totalEstimatedAgoraCost: 0,
        totalMargin: 0,
        fromDate: null,
        toDate: null,
      });
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
          maxWidth: "1200px",
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
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Ordini</h1>
          <p
            style={{
              opacity: 0.82,
              fontSize: "0.9rem",
              marginTop: "6px",
              maxWidth: "700px",
              color: colors.textSoft,
            }}
          >
            Elenco ordini/licenze generate tramite il sito VoiceGuide AirLink.
          </p>
        </div>

        {/* Card riepilogo periodo + totali */}
        <div
          style={{
            background: colors.bgDeep,
            borderRadius: "16px",
            padding: "16px 20px",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.6)",
            border: `1px solid ${colors.borderSoft}`,
            display: "flex",
            flexWrap: "wrap",
            gap: "18px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              opacity: 0.88,
              color: colors.textSoft,
            }}
          >
            <div style={{ opacity: 0.7, marginBottom: "2px" }}>Periodo</div>
            <div>
              {summary.fromDate && summary.toDate
                ? `${summary.fromDate} → ${summary.toDate}`
                : "Periodo non specificato"}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
            <MiniStat
              label="Numero ordini"
              value={summary.totalCount || orders.length || 0}
            />
            <MiniStat
              label="Totale incassato"
              value={formatEuro(summary.totalAmount || 0)}
            />
            <MiniStat
              label="Costo Agora stimato"
              value={formatEuro(summary.totalEstimatedAgoraCost || 0)}
            />
            <MiniStat
              label="Margine lordo"
              value={formatEuro(summary.totalMargin || 0)}
            />
          </div>
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

        {/* Tabella ordini */}
        <div
          style={{
            background: colors.card,
            borderRadius: "16px",
            padding: "20px 24px",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            border: `1px solid ${colors.borderSoft}`,
          }}
        >
          {loading && <p>Caricamento ordini...</p>}

          {!loading && orders.length === 0 && !error && (
            <p style={{ opacity: 0.8, fontSize: "0.9rem", color: colors.textSoft }}>
              Nessun ordine trovato nel periodo selezionato.
            </p>
          )}

          {!loading && orders.length > 0 && (
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
                    <Th>ID</Th>
                    <Th>Data</Th>
                    <Th>Cliente</Th>
                    <Th>Partner</Th>
                    <Th>Tipo</Th>

                    <Th>Fattura</Th>
                    <Th>Intestatario</Th>
                    <Th>Paese</Th>
                    <Th>P.IVA / VAT</Th>
                    <Th>Codice Fiscale</Th>
                    <Th>SDI</Th>
                    <Th>PEC</Th>
                    <Th>Indirizzo</Th>

                    <Th>Subtotale</Th>
                    <Th>Sconto</Th>
                    <Th>Totale</Th>
                    <Th>Costo Agora</Th>
                    <Th>Margine</Th>
                    <Th>Pagamento</Th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((o) => {
                    const subtotal = o.subtotal_amount;
                    const discount = o.discount_amount;
                    const total = o.total_amount;

                    const hasDiscount =
                      Number(discount || 0) > 0 &&
                      (o.referral_code || o.partner_id != null);

                    // ✅ Fatturazione (retrocompat)
                    const invoiceRequested = Boolean(
                      o.invoice_requested ??
                        o.request_invoice ??
                        o.billing_requested ??
                        false
                    );

                    // ✅ Dettagli fatturazione (nuovo payload backend)
                    const bd = o.billing_details || null;

                    const invoiceIntestatario =
                      (bd?.company_name ||
                        o.invoice_intestatario ||
                        o.billing_company_name ||
                        o.billing_company ||
                        o.company_name ||
                        "")?.trim() || "—";

                    const invoiceCountry = (bd?.country || o.invoice_country || "")?.trim() || "—";
                    const invoiceVat = (bd?.vat_number || "")?.trim() || "—";
                    const invoiceTaxCode = (bd?.tax_code || "")?.trim() || "—";
                    const invoiceSdi = (bd?.sdi_code || "")?.trim() || "—";
                    const invoicePec = (bd?.pec || "")?.trim() || "—";

                    const invoiceAddressLine = (bd?.address || "")?.trim();
                    const invoiceCity = (bd?.city || "")?.trim();
                    const invoiceZip = (bd?.zip_code || "")?.trim();
                    const invoiceProv = (bd?.province || "")?.trim();

                    const invoiceAddress =
                      [invoiceAddressLine, invoiceZip, invoiceCity, invoiceProv]
                        .filter(Boolean)
                        .join(", ") || "—";

                    return (
                      <tr key={o.id}>
                        <Td>{o.id}</Td>
                        <Td>{o.created_at}</Td>

                        <Td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span>{o.buyer_email}</span>
                            {o.buyer_whatsapp && (
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  opacity: 0.7,
                                  color: colors.textSoft,
                                }}
                              >
                                {o.buyer_whatsapp}
                              </span>
                            )}
                          </div>
                        </Td>

                        <Td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  opacity: 0.85,
                                  color: colors.textSoft,
                                }}
                              >
                                Partner ID: {o.partner_id ?? "—"}
                              </span>

                              {hasDiscount && (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "2px 8px",
                                    borderRadius: "999px",
                                    background: "rgba(253,197,0,0.12)",
                                    border: `1px solid ${colors.accentStrongBorder}`,
                                    color: colors.accent,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  -5% applicato
                                </span>
                              )}
                            </div>

                            {o.referral_code && (
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: "0.8rem",
                                  padding: "2px 8px",
                                  borderRadius: "999px",
                                  background: colors.bg,
                                  border: `1px solid ${colors.borderSoft}`,
                                  width: "fit-content",
                                }}
                              >
                                {o.referral_code}
                              </span>
                            )}
                          </div>
                        </Td>

                        <Td>{o.order_type || "SINGLE"}</Td>

                        {/* Fattura */}
                        <Td>
                          {invoiceRequested ? (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                background: "rgba(253,197,0,0.12)",
                                border: `1px solid ${colors.accentStrongBorder}`,
                                color: colors.accent,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Sì
                            </span>
                          ) : (
                            <span style={{ opacity: 0.7, color: colors.textSoft }}>
                              No
                            </span>
                          )}
                        </Td>

                        {/* Intestatario */}
                        <Td>
                          {invoiceRequested ? (
                            <span>{invoiceIntestatario}</span>
                          ) : (
                            <span style={{ opacity: 0.6, color: colors.textSoft }}>—</span>
                          )}
                        </Td>

                        {/* Paese */}
                        <Td>
                          {invoiceRequested ? (
                            <span style={{ fontFamily: "monospace" }}>{invoiceCountry}</span>
                          ) : (
                            <span style={{ opacity: 0.6, color: colors.textSoft }}>—</span>
                          )}
                        </Td>

                        {/* VAT */}
                        <Td>
                          {invoiceRequested ? (
                            <span style={{ fontFamily: "monospace" }}>{invoiceVat}</span>
                          ) : (
                            <span style={{ opacity: 0.6, color: colors.textSoft }}>—</span>
                          )}
                        </Td>

                        {/* CF */}
                        <Td>
                          {invoiceRequested ? (
                            <span style={{ fontFamily: "monospace" }}>{invoiceTaxCode}</span>
                          ) : (
                            <span style={{ opacity: 0.6, color: colors.textSoft }}>—</span>
                          )}
                        </Td>

                        {/* SDI */}
                        <Td>
                          {invoiceRequested ? (
                            <span style={{ fontFamily: "monospace" }}>{invoiceSdi}</span>
                          ) : (
                            <span style={{ opacity: 0.6, color: colors.textSoft }}>—</span>
                          )}
                        </Td>

                        {/* PEC */}
                        <Td>
                          {invoiceRequested ? (
                            <span style={{ fontFamily: "monospace" }}>{invoicePec}</span>
                          ) : (
                            <span style={{ opacity: 0.6, color: colors.textSoft }}>—</span>
                          )}
                        </Td>

                        {/* Indirizzo */}
                        <Td>
                          {invoiceRequested ? (
                            <span style={{ whiteSpace: "normal" }}>{invoiceAddress}</span>
                          ) : (
                            <span style={{ opacity: 0.6, color: colors.textSoft }}>—</span>
                          )}
                        </Td>

                        <Td>{subtotal != null ? formatEuro(subtotal) : "—"}</Td>
                        <Td>{discount != null ? formatEuro(discount) : "—"}</Td>
                        <Td>{total != null ? formatEuro(total) : "—"}</Td>

                        <Td>
                          {o.estimated_agora_cost != null
                            ? formatEuro(o.estimated_agora_cost)
                            : "—"}
                        </Td>

                        <Td>{o.margin != null ? formatEuro(o.margin) : "—"}</Td>

                        <Td>
                          <PaymentBadge status={o.payment_status} method={o.payment_method} />
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div
                style={{
                  marginTop: 12,
                  fontSize: "0.8rem",
                  opacity: 0.75,
                  color: colors.textSoft,
                }}
              >
                Nota: i campi fatturazione sono mostrati solo quando “Fattura = Sì”.
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div
      style={{
        minWidth: "140px",
        padding: "8px 10px",
        borderRadius: "10px",
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
      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.accent }}>
        {value}
      </div>
    </div>
  );
}

function PaymentBadge({ status, method }) {
  const isPaid = status === "PAID";

  return (
    <span
      style={{
        fontSize: "0.8rem",
        padding: "3px 10px",
        borderRadius: "999px",
        background: isPaid ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.15)",
        border: isPaid
          ? "1px solid rgba(34,197,94,0.7)"
          : `1px solid ${colors.borderSoft}`,
        color: isPaid ? "#bbf7d0" : "#e5e7eb",
        whiteSpace: "nowrap",
      }}
    >
      {status || "—"} {method ? `· ${method}` : ""}
    </span>
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
        whiteSpace: "nowrap",
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
