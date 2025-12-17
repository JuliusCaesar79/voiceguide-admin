// src/pages/partner/PartnerLogin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoVGAirlink from "../../assets/logo-voiceguide-airlink.png";
import { colors } from "../../theme/adminTheme";
import apiClient from "../../api/client";

// i18n
import { t, getLang, onLangChange } from "../../i18n";

export default function PartnerLogin() {
  const navigate = useNavigate();

  // re-render al cambio lingua (trigger)
  const [_lang, setLang] = useState(getLang());
  useEffect(() => {
    const off = onLangChange((l) => setLang(l || getLang()));
    return off;
  }, []);

  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/partner/login", {
        email: email.trim(),
        referral_code: referralCode.trim(),
      });

      const token = res.data?.access_token;
      if (!token) throw new Error("Missing access_token");

      localStorage.setItem("partner_token", token);
      navigate("/partner/dashboard");
    } catch (err) {
      console.error("Partner login error:", err);
      setError(t("auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrapper}>
          <div style={styles.logoCircle}>
            <img
              src={logoVGAirlink}
              alt="VoiceGuide AirLink"
              style={styles.logoImage}
            />
          </div>
          <div>
            <div style={styles.logoText}>VOICEGUIDE</div>
            <div style={styles.logoSub}>{t("auth.portalSubtitle")}</div>
          </div>
        </div>

        <h1 style={styles.title}>{t("auth.title")}</h1>
        <p style={styles.subtitle}>{t("auth.subtitle")}</p>

        <form onSubmit={handleLogin} style={{ marginTop: "1.5rem" }}>
          <div style={{ marginBottom: "0.75rem", textAlign: "left" }}>
            <label style={styles.label}>{t("auth.emailLabel")}</label>
            <input
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label style={styles.label}>{t("auth.partnerCodeLabel")}</label>
            <input
              type="text"
              placeholder={t("auth.partnerCodePlaceholder")}
              required
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              style={styles.input}
              autoComplete="off"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? t("auth.loggingIn") : t("auth.loginCta")}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.footer}>
          <span style={{ opacity: 0.7, fontSize: "0.8rem" }}>
            {t("auth.footerLeft")}
          </span>
          <span style={styles.powered}>
            {t("auth.poweredBy")} <strong>Virgilius</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    margin: 0,
    padding: "24px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at top, #111827 0, #050816 36%, #020617 100%)",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background:
      "radial-gradient(circle at top left, rgba(253,197,0,0.08), transparent 60%), " +
      colors.bg,
    borderRadius: "20px",
    padding: "30px 32px 22px",
    boxShadow: "0 22px 50px rgba(0, 0, 0, 0.75)",
    border: `1px solid ${colors.accentBorder}`,
    maxWidth: "420px",
    width: "100%",
    color: colors.text,
    textAlign: "center",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "10px",
  },
  logoCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${colors.accentStrongBorder}`,
    boxShadow: "0 0 24px rgba(253,197,0,0.45)",
  },
  logoImage: {
    width: "42px",
    height: "42px",
    objectFit: "contain",
  },
  logoText: {
    fontSize: "0.95rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    color: colors.accent,
  },
  logoSub: {
    fontSize: "0.75rem",
    opacity: 0.8,
    color: colors.textMuted,
  },
  title: {
    fontSize: "1.4rem",
    fontWeight: 700,
    marginTop: "10px",
    marginBottom: "0.4rem",
  },
  subtitle: {
    fontSize: "0.9rem",
    opacity: 0.8,
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    marginBottom: "4px",
    opacity: 0.78,
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.8rem",
    borderRadius: "999px",
    border: `1px solid ${colors.borderSoft}`,
    background: colors.bgDeep,
    color: colors.text,
    fontSize: "0.9rem",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    background: "linear-gradient(135deg, #FDC500, #FBBF24, #E2AA00)",
    borderRadius: "999px",
    border: "none",
    color: "#1F2933",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.95rem",
    marginTop: "4px",
    boxShadow: "0 12px 35px rgba(253,197,0,0.45)",
  },
  error: {
    marginTop: "0.9rem",
    color: colors.dangerSoft,
    fontSize: "0.85rem",
  },
  footer: {
    marginTop: "1.2rem",
    borderTop: "1px solid rgba(15,23,42,0.9)",
    paddingTop: "0.6rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.75rem",
    opacity: 0.9,
  },
  powered: {
    fontSize: "0.78rem",
    color: colors.accent,
  },
};
