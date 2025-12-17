// src/components/partner/PartnerLayout.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoVGAirlink from "../../assets/logo-voiceguide-airlink.png";
import { colors } from "../../theme/adminTheme";

// i18n
import { t, getLang, setLang, onLangChange } from "../../i18n";

export default function PartnerLayout({ children }) {
  const navigate = useNavigate();

  // Stato lingua (serve per re-render immediato)
  const [lang, setLangState] = useState(getLang());

  // Ascolta cambi lingua e aggiorna lo stato
  useEffect(() => {
    const off = onLangChange((newLang) => {
      setLangState(newLang || getLang());
    });
    return off;
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("partner_token");
    navigate("/partner/login");
  };

  const toggleLang = () => {
    const next = lang === "it" ? "en" : "it";
    setLang(next);
  };

  return (
    <div style={styles.appShell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoImageWrapper}>
            <img
              src={logoVGAirlink}
              alt="VoiceGuide AirLink"
              style={styles.logoImage}
            />
          </div>
          <div>
            <div style={styles.logoText}>VOICEGUIDE</div>
            <div style={styles.logoSub}>{t("common.appName")}</div>
          </div>
        </div>

        {/* Language switch */}
        <div style={styles.langRow}>
          <span style={styles.langLabel}>{t("common.language")}:</span>
          <button type="button" onClick={toggleLang} style={styles.langButton}>
            {lang === "it" ? "IT" : "EN"}
          </button>
        </div>

        <nav style={styles.nav}>
          <NavItem to="/partner/dashboard" label={t("dashboard.title")} />
          <NavItem to="/partner/orders" label={t("dashboard.orders")} />
        </nav>

        <button type="button" onClick={handleLogout} style={styles.logoutButton}>
          {t("common.logout")}
        </button>
      </aside>

      {/* Contenuto principale */}
      <main style={styles.main}>{children}</main>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...styles.navItem,
        backgroundColor: isActive ? colors.accentSoft : "transparent",
        color: isActive ? "#FDFDFD" : colors.textMuted,
        borderColor: isActive ? colors.accentBorder : "transparent",
        boxShadow: isActive ? "0 0 0 1px rgba(253,197,0,0.25)" : "none",
      })}
    >
      {label}
    </NavLink>
  );
}

const styles = {
  appShell: {
    minHeight: "100vh",
    display: "flex",
    background: colors.bg,
    color: colors.text,
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  sidebar: {
    width: "240px",
    padding: "24px 20px",
    background:
      "radial-gradient(circle at top, #111827 0, #020617 40%, #020617 100%)",
    borderRight: `1px solid ${colors.accentBorder}`,
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },
  logoImageWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${colors.accentStrongBorder}`,
    boxShadow: "0 0 18px rgba(253,197,0,0.35)",
  },
  logoImage: {
    width: "34px",
    height: "34px",
    objectFit: "contain",
  },
  logoText: {
    fontSize: "1.05rem",
    fontWeight: 800,
    letterSpacing: "0.06em",
    color: colors.accent,
  },
  logoSub: {
    fontSize: "0.75rem",
    opacity: 0.78,
    color: colors.textMuted,
  },

  langRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "999px",
    border: `1px solid ${colors.accentBorder}`,
    background: "rgba(255,255,255,0.03)",
  },
  langLabel: {
    fontSize: "0.85rem",
    color: colors.textMuted,
  },
  langButton: {
    padding: "6px 12px",
    borderRadius: "999px",
    border: `1px solid ${colors.accentStrongBorder}`,
    background: "transparent",
    color: colors.accent,
    fontWeight: 800,
    letterSpacing: "0.05em",
    cursor: "pointer",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "2px",
    flex: 1,
  },
  navItem: {
    padding: "10px 12px",
    borderRadius: "999px",
    fontSize: "0.9rem",
    textDecoration: "none",
    transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s",
    border: "1px solid transparent",
  },
  logoutButton: {
    marginTop: "auto",
    padding: "10px 12px",
    borderRadius: "999px",
    border: `1px solid ${colors.accentBorder}`,
    background: "transparent",
    color: colors.accent,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    padding: "24px 32px",
    overflowX: "hidden",
  },
};
