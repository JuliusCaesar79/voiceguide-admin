// src/pages/partner/PartnerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PartnerLayout from "../../components/partner/PartnerLayout";
import apiClient from "../../api/client";
import { colors } from "../../theme/adminTheme";

// i18n
import { t, getLang, onLangChange } from "../../i18n";

const PARTNER_SUMMARY_ENDPOINT = "/partner/summary";
const PARTNER_ME_ENDPOINT = "/partner/me";

export default function PartnerDashboard() {
  const navigate = useNavigate();

  // forza re-render al cambio lingua
  const [lang, setLang] = useState(getLang());

  const [summary, setSummary] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const off = onLangChange((newLang) => setLang(newLang || getLang()));
    return off;
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      setCopyMessage("");

      try {
        const token = localStorage.getItem("partner_token");
        if (!token) {
          setError(t("errors.partnerTokenMissing"));
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, meRes] = await Promise.all([
          apiClient.get(PARTNER_SUMMARY_ENDPOINT, { headers }),
          apiClient.get(PARTNER_ME_ENDPOINT, { headers }),
        ]);

        setSummary(summaryRes.data || {});
        setPartnerInfo(meRes.data || {});
      } catch (err) {
        console.error(err);
        setError(t("errors.partnerDataLoad"));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lang]);

  const formatMoney = (value) => {
    const num = Number(value);
    const safe = Number.isFinite(num) ? num : 0;

    // Formattazione valuta in base alla lingua
    const locale = lang === "en" ? "en-GB" : "it-IT";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(safe);
  };

  // =========================
  //  NUOVA SEMANTICA (preferita)
  //  total_generated = commissioni maturate
  //  total_paid      = pagamenti reali ricevuti
  //  balance_due     = saldo residuo (maturato - ricevuto)
  // =========================
  const totalGeneratedRaw = summary?.total_generated ?? summary?.total_commission ?? 0;

  const totalPaidRaw = summary?.total_paid ?? summary?.paid_commission ?? 0;

  const totalGenerated = Number(totalGeneratedRaw) || 0;
  const totalPaid = Number(totalPaidRaw) || 0;

  const balanceDueRaw =
    summary?.balance_due ?? summary?.pending_commission ?? totalGenerated - totalPaid;

  const balanceDue = Number(balanceDueRaw) || 0;

  const totalOrders = Number(summary?.total_orders ?? 0) || 0;
  const totalLicenses = Number(summary?.total_licenses_sold ?? 0) || 0;

  const partnerLevel =
    summary?.partner_level || partnerInfo?.partner_level || t("dashboard.levelUnavailable");

  const partnerType = summary?.partner_type || partnerInfo?.partner_type || "BASE";

  const commissionPct = Number(summary?.commission_pct ?? partnerInfo?.commission_pct ?? 0) || 0;

  const referralCode = partnerInfo?.referral_code || "—";
  const partnerEmail = partnerInfo?.email || "—";
  const partnerName = partnerInfo?.name || "";

  const REF_BASE_URL =
    (import.meta.env && import.meta.env.VITE_PARTNER_REF_BASE_URL) || window.location.origin;

  const referralLink =
    referralCode && referralCode !== "—"
      ? `${REF_BASE_URL}/?ref=${encodeURIComponent(referralCode)}`
      : "";

  const handleCopyLink = async () => {
    if (!referralLink) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = referralLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setCopyMessage(t("dashboard.copyOk"));
      setTimeout(() => setCopyMessage(""), 2500);
    } catch (err) {
      console.error("Errore copia link:", err);
      setCopyMessage(t("dashboard.copyFail"));
      setTimeout(() => setCopyMessage(""), 2500);
    }
  };

  return (
    <PartnerLayout>
      <div style={styles.page}>
        {/* Header + bottone ordini */}
        <div style={styles.headerRow}>
          <div>
            <div style={styles.breadcrumb}>{t("dashboard.breadcrumb")}</div>
            <h1 style={styles.pageTitle}>{t("dashboard.title")}</h1>
            <p style={styles.pageSubtitle}>{t("dashboard.subtitle")}</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/partner/orders")}
            style={styles.primaryGhostButton}
          >
            {t("dashboard.viewOrders")}
          </button>
        </div>

        {/* Messaggi di stato */}
        {loading && <div style={styles.infoBanner}>{t("dashboard.loading")}</div>}
        {error && !loading && <div style={styles.errorBanner}>{error}</div>}
        {copyMessage && <div style={styles.successBanner}>{copyMessage}</div>}

        {!loading && !error && (
          <>
            {/* Dati partner + Stato partnership */}
            <div style={styles.gridTwo}>
              {/* Card Dati partner */}
              <div style={styles.card}>
                <div style={styles.cardHeaderRow}>
                  <h2 style={styles.cardTitle}>{t("dashboard.partnerData")}</h2>
                  <span style={styles.statusPill}>{t("dashboard.active")}</span>
                </div>

                {partnerName && (
                  <>
                    <div style={styles.fieldLabel}>{t("dashboard.name")}</div>
                    <div style={styles.fieldValue}>{partnerName}</div>
                  </>
                )}

                <div style={styles.fieldLabel}>{t("dashboard.email")}</div>
                <div style={styles.fieldValue}>{partnerEmail}</div>

                <div style={styles.fieldLabel}>{t("dashboard.partnerCode")}</div>
                <div style={styles.codeValue}>{referralCode}</div>

                <div style={styles.fieldLabel}>{t("dashboard.affiliateLink")}</div>
                {referralLink ? (
                  <>
                    <div style={styles.linkValue}>{referralLink}</div>
                    <button type="button" onClick={handleCopyLink} style={styles.smallButton}>
                      {t("dashboard.copyAffiliate")}
                    </button>
                  </>
                ) : (
                  <div style={styles.mutedText}>{t("dashboard.affiliateNotReady")}</div>
                )}
              </div>

              {/* Card Stato partnership */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>{t("dashboard.partnershipStatus")}</h2>

                <div style={styles.fieldLabel}>{t("dashboard.partnerLevel")}</div>
                <div style={styles.fieldValue}>{partnerLevel}</div>

                <div style={styles.mutedText}>
                  {t("dashboard.partnerTypeLine", {
                    type: partnerType,
                    pct: commissionPct,
                  })}
                </div>

                <div style={{ height: "16px" }} />

                <div style={styles.fieldLabel}>{t("dashboard.residualBalance")}</div>
                <div style={styles.bigNumber}>{formatMoney(balanceDue)}</div>
                <div style={styles.mutedText}>{t("dashboard.balanceHint")}</div>

                <div style={{ height: "10px" }} />

                <div style={styles.fieldLabel}>{t("dashboard.receivedPayments")}</div>
                <div style={styles.fieldValue}>{formatMoney(totalPaid)}</div>
                <div style={styles.mutedText}>{t("dashboard.paidHint")}</div>
              </div>
            </div>

            {/* Statistiche principali */}
            <div style={styles.gridThree}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>{t("dashboard.totalCommissions")}</div>
                <div style={styles.statValue}>{formatMoney(totalGenerated)}</div>
                <div style={styles.statHint}>{t("dashboard.totalCommissionsHint")}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>{t("dashboard.totalOrders")}</div>
                <div style={styles.statValue}>{totalOrders}</div>
                <div style={styles.statHint}>{t("dashboard.totalOrdersHint")}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>{t("dashboard.soldLicenses")}</div>
                <div style={styles.statValue}>{totalLicenses}</div>
                <div style={styles.statHint}>{t("dashboard.soldLicensesHint")}</div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => navigate("/partner/orders")}
                style={{
                  ...styles.smallButton,
                  padding: "10px 14px",
                  boxShadow: "0 14px 32px rgba(253,197,0,0.25)",
                }}
              >
                {t("dashboard.goToOrders")}
              </button>
            </div>
          </>
        )}
      </div>
    </PartnerLayout>
  );
}

const styles = {
  page: {
    color: colors.text,
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "24px",
    marginBottom: "18px",
  },
  breadcrumb: {
    fontSize: "0.75rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: colors.textSoft,
    marginBottom: "4px",
  },
  pageTitle: {
    fontSize: "1.6rem",
    fontWeight: 700,
    margin: 0,
  },
  pageSubtitle: {
    marginTop: "4px",
    fontSize: "0.9rem",
    color: colors.textSoft,
  },
  primaryGhostButton: {
    padding: "8px 14px",
    borderRadius: "999px",
    border: `1px solid ${colors.borderSoft}`,
    background: "transparent",
    color: colors.text,
    fontSize: "0.85rem",
    cursor: "pointer",
  },
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
  successBanner: {
    marginBottom: "10px",
    padding: "8px 10px",
    borderRadius: "8px",
    background: "rgba(22,163,74,0.4)",
    border: "1px solid rgba(74,222,128,0.9)",
    fontSize: "0.8rem",
    color: colors.success,
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
    gap: "16px",
    marginBottom: "18px",
  },
  card: {
    background: colors.card,
    borderRadius: "16px",
    padding: "16px 18px 14px",
    border: `1px solid ${colors.borderSoft}`,
    boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  cardTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  statusPill: {
    padding: "4px 10px",
    borderRadius: "999px",
    border: `1px solid ${colors.accentBorder}`,
    background: colors.accentSoft,
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: colors.accent,
  },
  fieldLabel: {
    marginTop: "6px",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: colors.textSoft,
  },
  fieldValue: {
    fontSize: "0.92rem",
    fontWeight: 500,
    marginTop: "2px",
  },
  codeValue: {
    marginTop: "2px",
    fontSize: "0.9rem",
    fontFamily: "monospace",
    fontWeight: 600,
  },
  linkValue: {
    marginTop: "4px",
    fontSize: "0.8rem",
    wordBreak: "break-all",
    color: colors.textMuted,
  },
  mutedText: {
    marginTop: "4px",
    fontSize: "0.78rem",
    color: colors.textSoft,
  },
  smallButton: {
    marginTop: "6px",
    padding: "6px 12px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #FDC500, #FBBF24, #E2AA00)",
    color: "#111827",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  bigNumber: {
    marginTop: "4px",
    fontSize: "1.2rem",
    fontWeight: 600,
  },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: "16px",
  },
  statCard: {
    background: colors.card,
    borderRadius: "16px",
    padding: "14px 16px 12px",
    border: `1px solid ${colors.borderSoft}`,
  },
  statLabel: {
    fontSize: "0.8rem",
    color: colors.textSoft,
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "1.4rem",
    fontWeight: 600,
  },
  statHint: {
    marginTop: "4px",
    fontSize: "0.78rem",
    color: colors.textSoft,
  },
};
