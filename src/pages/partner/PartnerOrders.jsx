// src/pages/partner/PartnerOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import PartnerLayout from "../../components/partner/PartnerLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

// i18n
import { t, getLang, onLangChange } from "../../i18n";

const PARTNER_ORDERS_ENDPOINT = "/partner/orders";

export default function PartnerOrders() {
  const [lang, setLang] = useState(getLang());

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // re-render al cambio lingua
  useEffect(() => {
    const off = onLangChange((l) => setLang(l || getLang()));
    return off;
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("partner_token");
        if (!token) {
          setError(t("errors.partnerTokenMissing"));
          setLoading(false);
          return;
        }

        const response = await apiClient.get(PARTNER_ORDERS_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];

        setOrders(list);
      } catch (err) {
        console.error(err);
        setError(t("orders.loadError"));
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [lang]);

  const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";

    const locale = lang === "en" ? "en-GB" : "it-IT";

    return d.toLocaleString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMoney = (value) => {
    if (value == null || value === "") return "—";
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(num)) return "—";

    const locale = lang === "en" ? "en-GB" : "it-IT";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(num);
  };

  // ---- Status helpers ----
  const normStatus = (raw) => {
    if (!raw) return "unknown";
    const s = String(raw).toLowerCase();

    if (s === "paid") return "paid";
    if (s === "pending_payout") return "pending_payout";
    if (s === "pending" || s === "payment_pending") return "payment_pending";
    if (s === "failed" || s === "payment_failed") return "payment_failed";
    if (s === "refunded") return "refunded";

    return "unknown";
  };

  const statusLabel = (raw) => {
    switch (normStatus(raw)) {
      case "paid":
        return t("orders.status.paid");
      case "pending_payout":
        return t("orders.status.pendingPayout");
      case "payment_pending":
        return t("orders.status.paymentPending");
      case "payment_failed":
        return t("orders.status.paymentFailed");
      case "refunded":
        return t("orders.status.refunded");
      default:
        return t("orders.status.unknown");
    }
  };

  const statusColor = (raw) => {
    switch (normStatus(raw)) {
      case "paid":
        return { bg: "rgba(22,163,74,0.22)", border: "rgba(74,222,128,0.6)" };
      case "pending_payout":
        return { bg: "rgba(245,158,11,0.16)", border: "rgba(251,191,36,0.7)" };
      case "payment_pending":
        return { bg: "rgba(37,99,235,0.18)", border: "rgba(96,165,250,0.7)" };
      case "payment_failed":
        return { bg: "rgba(185,28,28,0.25)", border: "rgba(248,113,113,0.8)" };
      case "refunded":
        return { bg: "rgba(148,163,184,0.16)", border: "rgba(148,163,184,0.7)" };
      default:
        return { bg: "rgba(148,163,184,0.16)", border: "rgba(148,163,184,0.5)" };
    }
  };

  // ---- Summary ----
  const summary = useMemo(() => {
    const sum = (arr, get) =>
      arr.reduce((acc, x) => {
        const n = Number(get(x) || 0);
        return acc + (Number.isNaN(n) ? 0 : n);
      }, 0);

    return {
      totalCount: orders.length,
      totalVolume: sum(orders, (o) => o.total_amount ?? o.gross_amount),
      totalCommission: sum(orders, (o) => o.commission_amount),
      paidCommission: sum(
        orders.filter((o) => normStatus(o.status) === "paid"),
        (o) => o.commission_amount
      ),
      pendingCommission: sum(
        orders.filter((o) => normStatus(o.status) === "pending_payout"),
        (o) => o.commission_amount
      ),
    };
  }, [orders]);

  return (
    <PartnerLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>{t("orders.breadcrumb")}</div>
            <h1 style={styles.pageTitle}>{t("orders.title")}</h1>
            <p style={styles.pageSubtitle}>{t("orders.subtitle")}</p>
          </div>
        </div>

        {!loading && !error && (
          <div style={styles.summaryRow}>
            <MiniStat label={t("orders.stats.count")} value={summary.totalCount} />
            <MiniStat label={t("orders.stats.volume")} value={formatMoney(summary.totalVolume)} />
            <MiniStat
              label={t("orders.stats.totalCommission")}
              value={formatMoney(summary.totalCommission)}
            />
            <MiniStat
              label={t("orders.stats.pendingCommission")}
              value={formatMoney(summary.pendingCommission)}
            />
            <MiniStat
              label={t("orders.stats.paidCommission")}
              value={formatMoney(summary.paidCommission)}
            />
          </div>
        )}

        {loading && <div style={styles.infoBanner}>{t("orders.loading")}</div>}
        {error && !loading && <div style={styles.errorBanner}>{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div style={styles.emptyState}>{t("orders.empty")}</div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t("orders.table.date")}</th>
                  <th style={styles.th}>{t("orders.table.product")}</th>
                  <th style={styles.th}>{t("orders.table.subtotal")}</th>
                  <th style={styles.th}>{t("orders.table.discount")}</th>
                  <th style={styles.th}>{t("orders.table.total")}</th>
                  <th style={styles.th}>{t("orders.table.commission")}</th>
                  <th style={styles.th}>{t("orders.table.status")}</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const {
                    id,
                    created_at,
                    product_name,
                    license_type,
                    gross_amount,
                    commission_amount,
                    status,
                    subtotal_amount,
                    discount_amount,
                    total_amount,
                    referral_code,
                    referral_applied,
                  } = order;

                  const productLabel =
                    product_name || license_type || t("orders.defaultProduct");

                  const sc = statusColor(status);
                  const subtotal = subtotal_amount ?? null;
                  const discount = discount_amount ?? null;
                  const total = total_amount ?? gross_amount ?? null;

                  const hasDiscount =
                    Number(discount || 0) > 0 || referral_applied || referral_code;

                  return (
                    <tr key={id ?? created_at} style={styles.tr}>
                      <td style={styles.td}>{formatDateTime(created_at)}</td>

                      <td style={styles.td}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 600 }}>{productLabel}</span>
                            {hasDiscount && (
                              <span style={styles.discountPill}>
                                {t("orders.discountApplied")}
                              </span>
                            )}
                          </div>

                          {license_type && (
                            <span style={styles.subtype}>{license_type}</span>
                          )}
                          {referral_code && (
                            <span style={styles.codePill}>{referral_code}</span>
                          )}
                        </div>
                      </td>

                      <td style={styles.td}>
                        {subtotal != null ? formatMoney(subtotal) : "—"}
                      </td>
                      <td style={styles.td}>
                        {discount != null ? formatMoney(discount) : "—"}
                      </td>
                      <td style={styles.td}>
                        {total != null ? formatMoney(total) : "—"}
                      </td>
                      <td style={styles.td}>{formatMoney(commission_amount)}</td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusPill,
                            background: sc.bg,
                            borderColor: sc.border,
                          }}
                        >
                          {statusLabel(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div
      style={{
        minWidth: "170px",
        padding: "10px 12px",
        borderRadius: "12px",
        background:
          "radial-gradient(circle at top left, rgba(253,197,0,0.12), transparent 55%), " +
          colors.bg,
        border: `1px solid ${colors.accentBorder}`,
      }}
    >
      <div style={{ fontSize: "0.78rem", opacity: 0.78, color: colors.textSoft }}>
        {label}
      </div>
      <div style={{ fontSize: "0.98rem", fontWeight: 700, marginTop: "4px", color: colors.accent }}>
        {value}
      </div>
    </div>
  );
}

// styles invariati
const styles = {
  page: { color: colors.text },
  header: { marginBottom: "14px" },
  breadcrumb: {
    fontSize: "0.75rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: colors.textSoft,
    marginBottom: "4px",
  },
  pageTitle: { fontSize: "1.6rem", fontWeight: 700, margin: 0 },
  pageSubtitle: { marginTop: "4px", fontSize: "0.9rem", color: colors.textSoft },
  summaryRow: { display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "14px" },
  infoBanner: {
    marginBottom: "10px",
    padding: "8px 10px",
    borderRadius: "8px",
    background: "#0f172a",
    border: `1px solid ${colors.borderSoft}`,
    fontSize: "0.85rem",
  },
  errorBanner: {
    marginBottom: "10px",
    padding: "8px 10px",
    borderRadius: "8px",
    background: "rgba(127,29,29,0.6)",
    border: "1px solid rgba(248,113,113,0.7)",
    fontSize: "0.85rem",
    color: colors.dangerSoft,
  },
  emptyState: {
    padding: "18px 16px",
    borderRadius: "16px",
    background: colors.card,
    border: `1px dashed ${colors.borderSoft}`,
    fontSize: "0.9rem",
    color: colors.textSoft,
  },
  tableWrapper: {
    borderRadius: "16px",
    overflow: "hidden",
    border: `1px solid ${colors.borderSoft}`,
    background: colors.card,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: `1px solid ${colors.borderStrong}`,
    fontWeight: 500,
    color: colors.textSoft,
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: `1px solid rgba(15,23,42,0.9)` },
  td: { padding: "10px 12px", whiteSpace: "nowrap" },
  subtype: {
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    color: colors.textSoft,
  },
  codePill: {
    fontFamily: "monospace",
    fontSize: "0.78rem",
    padding: "2px 8px",
    borderRadius: "999px",
    background: colors.bg,
    border: `1px solid ${colors.borderSoft}`,
    width: "fit-content",
  },
  discountPill: {
    fontSize: "0.74rem",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "rgba(253,197,0,0.12)",
    border: `1px solid ${colors.accentStrongBorder}`,
    color: colors.accent,
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: "999px",
    border: "1px solid transparent",
    fontSize: "0.72rem",
    fontWeight: 600,
  },
};
