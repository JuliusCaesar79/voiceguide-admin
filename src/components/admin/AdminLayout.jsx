import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoVGAirlink from "../../assets/logo-voiceguide-airlink.png";
import { colors } from "../../theme/adminTheme";
import apiClient from "../../api/client"; // ✅ NEW (per badge count)

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [pendingTrialCount, setPendingTrialCount] = useState(null);

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

  useEffect(() => {
    loadPendingTrialCount();

    const t = setInterval(() => {
      loadPendingTrialCount();
    }, 20000);

    return () => clearInterval(t);
  }, []);

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
            <div style={styles.logoSub}>AirLink Admin Console</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <NavItem to="/admin/dashboard" label="Dashboard" />
          <NavItem to="/admin/orders" label="Ordini" />
          <NavItem to="/admin/payouts" label="Payouts" />
          <NavItem to="/admin/partners" label="Partner" />

          {/* ✅ NEW: Richieste Trial + badge */}
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
      </aside>

      {/* Contenuto principale */}
      <main style={styles.main}>{children}</main>
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
  sidebar: {
    width: "240px",
    padding: "24px 20px",
    background:
      "radial-gradient(circle at top, #111827 0, #020617 40%, #020617 100%)",
    borderRight: `1px solid ${colors.accentBorder}`,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
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
  main: {
    flex: 1,
    padding: "24px 32px",
    overflowX: "hidden",
  },
};
