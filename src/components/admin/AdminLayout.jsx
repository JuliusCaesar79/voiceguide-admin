import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logoVGAirlink from "../../assets/logo-voiceguide-airlink.png";
import { colors } from "../../theme/adminTheme";
import apiClient from "../../api/client"; // ✅ NEW (per badge count)

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingTrialCount, setPendingTrialCount] = useState(null);

  // ✅ Drawer mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("vg_admin_token");
    navigate("/admin/login");
  };

  async function loadPendingTrialCount() {
    try {
      const res = await apiClient.get("/admin/trial-requests/count", {
        params: { status: "PENDING" },
      });
      const count = Number(res?.data?.count ?? 0);
      setPendingTrialCount(Number.isFinite(count) ? count : 0);
    } catch (e) {
      // non blocchiamo UI: in caso di errore, badge non mostrato
      setPendingTrialCount(null);
    }
  }

  // Badge polling
  useEffect(() => {
    loadPendingTrialCount();

    const t = setInterval(() => {
      loadPendingTrialCount();
    }, 20000);

    return () => clearInterval(t);
  }, []);

  // Detect mobile breakpoint
  useEffect(() => {
    function compute() {
      const mobile = window.matchMedia("(max-width: 900px)").matches;
      setIsMobile(mobile);
      // se passo a desktop, chiudo drawer
      if (!mobile) setIsDrawerOpen(false);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Chiudi drawer su cambio route
  useEffect(() => {
    if (isMobile) setIsDrawerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Blocca scroll body quando drawer aperto
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const SidebarContent = () => (
    <>
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
          <div style={styles.logoSub}>AirLink Admin Console</div>
        </div>
      </div>

      <nav style={styles.nav}>
        <NavItem to="/admin/dashboard" label="Dashboard" />
        <NavItem to="/admin/orders" label="Ordini" />
        <NavItem to="/admin/payouts" label="Payouts" />
        <NavItem to="/admin/partners" label="Partner" />

        {/* ✅ Richieste Trial + badge */}
        <NavItem
          to="/admin/trial-requests"
          label="Richieste Trial"
          badge={pendingTrialCount}
        />

        {/* ✅ Licenze Trial (manual) */}
        <NavItem to="/admin/licenses/trial" label="Licenze Trial" />
      </nav>

      <button type="button" onClick={handleLogout} style={styles.logoutButton}>
        Esci
      </button>
    </>
  );

  return (
    <div style={styles.appShell}>
      {/* ✅ TOPBAR MOBILE */}
      {isMobile ? (
        <header style={styles.topbar}>
          <button
            type="button"
            aria-label="Apri menu"
            onClick={() => setIsDrawerOpen(true)}
            style={styles.burgerBtn}
          >
            <span style={styles.burgerIcon}>☰</span>
          </button>

          <div style={styles.topbarBrand}>
            <img
              src={logoVGAirlink}
              alt="VoiceGuide AirLink"
              style={styles.topbarLogo}
            />
            <div>
              <div style={styles.topbarTitle}>VOICEGUIDE</div>
              <div style={styles.topbarSub}>Admin</div>
            </div>
          </div>
        </header>
      ) : null}

      {/* ✅ SIDEBAR DESKTOP */}
      {!isMobile ? (
        <aside style={styles.sidebar}>
          <SidebarContent />
        </aside>
      ) : null}

      {/* ✅ DRAWER MOBILE */}
      {isMobile ? (
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
              transform: isDrawerOpen
                ? "translateX(0)"
                : "translateX(-110%)",
            }}
          >
            <div style={styles.drawerHeader}>
              <div style={styles.drawerHeaderLeft}>
                <img
                  src={logoVGAirlink}
                  alt="VoiceGuide AirLink"
                  style={styles.drawerLogo}
                />
                <div>
                  <div style={styles.drawerTitle}>VOICEGUIDE</div>
                  <div style={styles.drawerSub}>AirLink Admin</div>
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
      ) : null}

      {/* Contenuto principale */}
      <main style={isMobile ? styles.mainMobile : styles.main}>{children}</main>
    </div>
  );
}

function NavItem({ to, label, badge }) {
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
      <span style={styles.navItemRow}>
        <span>{label}</span>

        {typeof badge === "number" && badge > 0 ? (
          <span style={styles.badge}>{badge}</span>
        ) : null}
      </span>
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

  // --- Desktop sidebar
  sidebar: {
    width: "240px",
    padding: "24px 20px",
    background:
      "radial-gradient(circle at top, #111827 0, #020617 40%, #020617 100%)",
    borderRight: `1px solid ${colors.accentBorder}`,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    position: "sticky",
    top: 0,
    height: "100vh",
  },

  // --- Mobile topbar
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
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  burgerIcon: {
    fontSize: 20,
    lineHeight: 1,
    fontWeight: 900,
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
    boxShadow: "0 0 14px rgba(253,197,0,0.25)",
  },
  topbarTitle: {
    fontSize: "0.98rem",
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: colors.accent,
    lineHeight: 1.05,
  },
  topbarSub: {
    fontSize: "0.72rem",
    opacity: 0.78,
    color: colors.textMuted,
    marginTop: 2,
  },

  // --- Drawer mobile
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
    alignItems: "center",
    justifyContent: "space-between",
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
    boxShadow: "0 0 14px rgba(253,197,0,0.25)",
  },
  drawerTitle: {
    fontSize: "0.98rem",
    fontWeight: 900,
    letterSpacing: "0.06em",
    color: colors.accent,
    lineHeight: 1.05,
  },
  drawerSub: {
    fontSize: "0.72rem",
    opacity: 0.78,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: `1px solid ${colors.accentBorder}`,
    background: "transparent",
    color: colors.text,
    cursor: "pointer",
    fontSize: 18,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  drawerBody: {
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    overflowY: "auto",
    height: "100%",
  },

  // --- Common sidebar content styles
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
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
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "8px",
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
  navItemRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  badge: {
    minWidth: 22,
    height: 22,
    padding: "0 8px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
    background: colors.accent,
    color: "#000",
    boxShadow: "0 0 0 1px rgba(253,197,0,0.35)",
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

  // --- Main
  main: {
    flex: 1,
    padding: "24px 32px",
    overflowX: "hidden",
  },
  mainMobile: {
    flex: 1,
    padding: "84px 16px 24px", // spazio topbar + padding comodo
    overflowX: "hidden",
    width: "100%",
  },
};
