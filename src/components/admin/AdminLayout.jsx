import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logoVGAirlink from "../../assets/logo-voiceguide-airlink-trasparente.png";
import { colors, fontFamily } from "../../theme/adminTheme";
import apiClient from "../../api/client"; // badge count

// Restyle 2026-10: stile chiaro come il sito, menu più corto.
// "Richieste prova" compare solo se ce ne sono in attesa (la vecchia pagina
// trial del sito non esiste più: ora c'è la registrazione con 3 tour gratis).
export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingTrialCount, setPendingTrialCount] = useState(null);
  const [pendingPartnerCount, setPendingPartnerCount] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("vg_admin_token");
    navigate("/admin/login");
  };

  async function loadPendingTrialCount() {
    try {
      const res = await apiClient.get("/admin/trial-requests/count", { params: { status: "PENDING" } });
      const count = Number(res?.data?.count ?? 0);
      setPendingTrialCount(Number.isFinite(count) ? count : 0);
    } catch {
      setPendingTrialCount(null);
    }
  }

  async function loadPendingPartnerCount() {
    try {
      const res = await apiClient.get("/admin/partner-requests", { params: { status: "PENDING" } });
      setPendingPartnerCount(Array.isArray(res?.data) ? res.data.length : 0);
    } catch {
      setPendingPartnerCount(null);
    }
  }

  useEffect(() => {
    loadPendingTrialCount();
    loadPendingPartnerCount();
    const t = setInterval(() => {
      loadPendingTrialCount();
      loadPendingPartnerCount();
    }, 20000);
    return () => clearInterval(t);
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

  const showTrialRequests =
    (typeof pendingTrialCount === "number" && pendingTrialCount > 0) ||
    location.pathname.startsWith("/admin/trial-requests");

  const SidebarContent = () => (
    <>
      <div style={styles.logoArea}>
        <img src={logoVGAirlink} alt="VoiceGuide AirLink" style={styles.logoImage} />
        <span style={styles.logoSub}>Admin</span>
      </div>

      <nav style={styles.nav}>
        <NavItem to="/admin/dashboard" label="Panoramica" />
        <NavItem to="/admin/orders" label="Ordini" />
        <NavItem to="/admin/free-tours" label="Registrazioni" />

        <div style={styles.navGroup}>Partner</div>
        <NavItem to="/admin/partner-requests" label="Richieste partner" badge={pendingPartnerCount} />
        <NavItem to="/admin/partners" label="Partner attivi" />
        <NavItem to="/admin/payouts" label="Commissioni" />

        <div style={styles.navGroup}>Licenze</div>
        <NavItem to="/admin/licenses/trial" label="Crea licenza di prova" />
        {showTrialRequests ? (
          <NavItem to="/admin/trial-requests" label="Richieste prova" badge={pendingTrialCount} />
        ) : null}
      </nav>

      <button type="button" onClick={handleLogout} style={styles.logoutButton}>
        Esci
      </button>
    </>
  );

  return (
    <div style={styles.appShell}>
      {isMobile ? (
        <header style={styles.topbar}>
          <button type="button" aria-label="Apri menu" onClick={() => setIsDrawerOpen(true)} style={styles.burgerBtn}>
            <span style={styles.burgerIcon}>☰</span>
          </button>
          <img src={logoVGAirlink} alt="VoiceGuide AirLink" style={styles.topbarLogo} />
          <span style={styles.logoSub}>Admin</span>
        </header>
      ) : null}

      {!isMobile ? (
        <aside style={styles.sidebar}>
          <SidebarContent />
        </aside>
      ) : null}

      {isMobile ? (
        <>
          <div
            style={{ ...styles.overlay, opacity: isDrawerOpen ? 1 : 0, pointerEvents: isDrawerOpen ? "auto" : "none" }}
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside style={{ ...styles.drawer, transform: isDrawerOpen ? "translateX(0)" : "translateX(-110%)" }}>
            <div style={styles.drawerHeader}>
              <button type="button" aria-label="Chiudi menu" onClick={() => setIsDrawerOpen(false)} style={styles.closeBtn}>
                ✕
              </button>
            </div>
            <div style={styles.drawerBody}>
              <SidebarContent />
            </div>
          </aside>
        </>
      ) : null}

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
        color: isActive ? colors.text : colors.textMuted,
        fontWeight: isActive ? 700 : 500,
      })}
    >
      <span style={styles.navItemRow}>
        <span>{label}</span>
        {typeof badge === "number" && badge > 0 ? <span style={styles.badge}>{badge}</span> : null}
      </span>
    </NavLink>
  );
}

const styles = {
  appShell: { minHeight: "100vh", display: "flex", background: colors.bg, color: colors.text, fontFamily },

  sidebar: {
    width: 240,
    padding: "22px 16px",
    background: colors.card,
    borderRight: `1px solid ${colors.borderSoft}`,
    display: "flex",
    flexDirection: "column",
    gap: 18,
    position: "sticky",
    top: 0,
    height: "100vh",
  },

  topbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 14px",
    background: "rgba(255,255,255,0.94)",
    backdropFilter: "blur(10px)",
    borderBottom: `1px solid ${colors.borderSoft}`,
    zIndex: 50,
  },
  burgerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.card,
    color: colors.text,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  burgerIcon: { fontSize: 20, lineHeight: 1, fontWeight: 700 },
  topbarLogo: { height: 40, width: "auto" },

  overlay: { position: "fixed", inset: 0, background: "rgba(20,22,27,0.35)", zIndex: 60, transition: "opacity 0.18s ease" },
  drawer: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "84vw",
    maxWidth: 300,
    background: colors.card,
    borderRight: `1px solid ${colors.borderSoft}`,
    zIndex: 70,
    transition: "transform 0.18s ease",
    display: "flex",
    flexDirection: "column",
  },
  drawerHeader: { height: 56, padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.card,
    color: colors.text,
    cursor: "pointer",
    fontSize: 18,
  },
  drawerBody: { padding: "0 16px 18px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", height: "100%" },

  logoArea: { display: "flex", alignItems: "flex-end", gap: 8, padding: "0 6px 6px" },
  logoImage: { height: 54, width: "auto" },
  logoSub: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: colors.textSoft,
    background: colors.bgDeep,
    borderRadius: 999,
    padding: "3px 9px",
  },
  nav: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  navGroup: {
    margin: "14px 12px 4px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: colors.textSoft,
  },
  navItem: {
    padding: "10px 12px",
    minHeight: 40,
    borderRadius: 12,
    fontSize: 14.5,
    textDecoration: "none",
    transition: "background 0.15s ease, color 0.15s ease",
    display: "flex",
    alignItems: "center",
  },
  navItemRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%" },
  badge: {
    minWidth: 22,
    height: 22,
    padding: "0 7px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
    background: colors.accent,
    color: colors.text,
  },
  logoutButton: {
    marginTop: "auto",
    minHeight: 44,
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.card,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily,
  },

  main: { flex: 1, padding: "28px 36px", overflowX: "hidden", minWidth: 0 },
  mainMobile: { flex: 1, padding: "80px 14px 24px", overflowX: "hidden", width: "100%" },
};
