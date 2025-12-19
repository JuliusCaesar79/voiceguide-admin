// src/components/partner/PartnerLayout.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logoVGAirlink from "../../assets/logo-voiceguide-airlink.png";
import { colors } from "../../theme/adminTheme";

// i18n
import { t, getLang, setLang, onLangChange } from "../../i18n";

export default function PartnerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Stato lingua
  const [lang, setLangState] = useState(getLang());

  // Mobile drawer
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const off = onLangChange((newLang) => {
      setLangState(newLang || getLang());
    });
    return off;
  }, []);

  useEffect(() => {
    function compute() {
      const mobile = window.matchMedia("(max-width: 900px)").matches;
      setIsMobile(mobile);
      if (!mobile) setIsDrawerOpen(false);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (isMobile) setIsDrawerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const handleLogout = () => {
    localStorage.removeItem("partner_token");
    navigate("/partner/login");
  };

  const toggleLang = () => {
    const next = lang === "it" ? "en" : "it";
    setLang(next);
  };

  const SidebarContent = () => (
    <>
      <div style={styles.logoArea}>
        <div style={styles.logoImageWrapper}>
          <img src={logoVGAirlink} alt="VoiceGuide AirLink" style={styles.logoImage} />
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
    </>
  );

  return (
    <div style={styles.appShell}>
      {/* TOPBAR MOBILE */}
      {isMobile && (
        <header style={styles.topbar}>
          <button
            type="button"
            aria-label="Apri menu"
            onClick={() => setIsDrawerOpen(true)}
            style={styles.burgerBtn}
          >
            ☰
          </button>

          <div style={styles.topbarBrand}>
            <img src={logoVGAirlink} alt="VG" style={styles.topbarLogo} />
            <div>
              <div style={styles.topbarTitle}>VOICEGUIDE</div>
              <div style={styles.topbarSub}>Partner</div>
            </div>
          </div>
        </header>
      )}

      {/* SIDEBAR DESKTOP */}
      {!isMobile && (
        <aside style={styles.sidebar}>
          <SidebarContent />
        </aside>
      )}

      {/* DRAWER MOBILE */}
      {isMobile && (
        <>
          <div
            style={{
              ...styles.overlay,
              opacity: isDrawerOpen ? 1 : 0,
              pointerEvents: isDrawerOpen ? "auto" : "none",
            }}
            onClick={() => setIsDrawerOpen(false)}
          />

          <aside
            style={{
              ...styles.drawer,
              transform: isDrawerOpen ? "translateX(0)" : "translateX(-110%)",
            }}
          >
            <div style={styles.drawerHeader}>
              <div style={styles.drawerHeaderLeft}>
                <img src={logoVGAirlink} alt="VG" style={styles.drawerLogo} />
                <div>
                  <div style={styles.drawerTitle}>VOICEGUIDE</div>
                  <div style={styles.drawerSub}>Partner</div>
                </div>
              </div>

              <button
                type="button"
                aria-label="Chiudi menu"
                onClick={() => setIsDrawerOpen(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.drawerBody}>
              <SidebarContent />
            </div>
          </aside>
        </>
      )}

      {/* MAIN */}
      <main style={isMobile ? styles.mainMobile : styles.main}>{children}</main>
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
    width: 240,
    padding: "24px 20px",
    background:
      "radial-gradient(circle at top, #111827 0, #020617 40%, #020617 100%)",
    borderRight: `1px solid ${colors.accentBorder}`,
    display: "flex",
    flexDirection: "column",
    gap: 18,
    height: "100vh",
  },

  topbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 14px",
    background:
      "radial-gradient(circle at top, #111827 0, #020617 55%, #020617 100%)",
    borderBottom: `1px solid ${colors.accentBorder}`,
    zIndex: 50,
  },
  burgerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: `1px solid ${colors.accentBorder}`,
    background: "transparent",
    color: colors.accent,
    fontSize: 20,
    cursor: "pointer",
  },
  topbarBrand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  topbarLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "#fff",
    padding: 2,
    border: `1px solid ${colors.accentStrongBorder}`,
  },
  topbarTitle: {
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: colors.accent,
  },
  topbarSub: {
    fontSize: "0.72rem",
    color: colors.textMuted,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 60,
    transition: "opacity 0.18s ease",
  },
  drawer: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "84vw",
    maxWidth: 320,
    background:
      "radial-gradient(circle at top, #111827 0, #020617 40%, #020617 100%)",
    borderRight: `1px solid ${colors.accentBorder}`,
    zIndex: 70,
    transition: "transform 0.18s ease",
    display: "flex",
    flexDirection: "column",
  },
  drawerHeader: {
    height: 64,
    padding: "0 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${colors.accentBorder}`,
  },
  drawerHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  drawerLogo: {
    width: 36,
    height: 36,
    borderRadius: 12,
    background: "#fff",
    padding: 2,
    border: `1px solid ${colors.accentStrongBorder}`,
  },
  drawerTitle: {
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: colors.accent,
  },
  drawerSub: {
    fontSize: "0.72rem",
    color: colors.textMuted,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: `1px solid ${colors.accentBorder}`,
    background: "transparent",
    color: colors.text,
    fontSize: 18,
    cursor: "pointer",
  },
  drawerBody: {
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    overflowY: "auto",
    height: "100%",
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoImageWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${colors.accentStrongBorder}`,
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  logoText: {
    fontWeight: 800,
    letterSpacing: "0.06em",
    color: colors.accent,
  },
  logoSub: {
    fontSize: "0.75rem",
    color: colors.textMuted,
  },

  langRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${colors.accentBorder}`,
    background: "rgba(255,255,255,0.03)",
  },
  langLabel: {
    fontSize: "0.85rem",
    color: colors.textMuted,
  },
  langButton: {
    padding: "6px 12px",
    borderRadius: 999,
    border: `1px solid ${colors.accentStrongBorder}`,
    background: "transparent",
    color: colors.accent,
    fontWeight: 800,
    cursor: "pointer",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
  },
  navItem: {
    padding: "10px 12px",
    borderRadius: 999,
    fontSize: "0.9rem",
    textDecoration: "none",
    border: "1px solid transparent",
  },

  logoutButton: {
    marginTop: "auto",
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${colors.accentBorder}`,
    background: "transparent",
    color: colors.accent,
    cursor: "pointer",
  },

  main: {
    flex: 1,
    padding: "24px 32px",
  },
  mainMobile: {
    flex: 1,
    padding: "84px 16px 24px",
    width: "100%",
  },
};
