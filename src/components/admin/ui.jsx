// Elementi grafici comuni del pannello (restyle 2026-10, stile del sito).
import React from "react";
import { Link } from "react-router-dom";
import { colors, fontFamily } from "../../theme/adminTheme";

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={ui.header}>
      <div>
        <h1 style={ui.h1}>{title}</h1>
        {subtitle ? <p style={ui.subtitle}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, action, children, style }) {
  return (
    <section style={{ ...ui.card, ...style }}>
      {title ? (
        <div style={ui.cardHead}>
          <h2 style={ui.h2}>{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, accent }) {
  return (
    <div style={{ ...ui.stat, ...(accent ? ui.statAccent : null) }}>
      <span style={ui.statLabel}>{label}</span>
      <span style={ui.statValue}>{value}</span>
      {hint ? <span style={ui.statHint}>{hint}</span> : null}
    </div>
  );
}

export function Button({ children, onClick, disabled, variant = "ghost", type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...ui.btn, ...(variant === "primary" ? ui.btnPrimary : ui.btnGhost), opacity: disabled ? 0.6 : 1 }}>
      {children}
    </button>
  );
}

export function ArrowLink({ to, children }) {
  return (
    <Link to={to} style={ui.arrowLink}>
      {children} →
    </Link>
  );
}

export function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { background: colors.bgDeep, color: colors.textMuted },
    good: { background: "rgba(18,128,92,0.12)", color: colors.successSoft },
    warn: { background: colors.accentSoft, color: "#7A5600" },
    bad: { background: "rgba(217,45,32,0.10)", color: colors.dangerSoft },
  };
  return <span style={{ ...ui.pill, ...tones[tone] }}>{children}</span>;
}

export const eur = (n) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(n || 0));

export const dateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export const ui = {
  header: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 22 },
  h1: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: colors.text },
  subtitle: { margin: "6px 0 0", fontSize: 15, color: colors.textSoft },
  card: { background: colors.card, border: `1px solid ${colors.borderSoft}`, borderRadius: 20, padding: 20, boxShadow: "0 10px 30px rgba(20,22,27,0.05)" },
  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  h2: { margin: 0, fontSize: 17, fontWeight: 700, color: colors.text },
  stat: { background: colors.card, border: `1px solid ${colors.borderSoft}`, borderRadius: 18, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 10px 30px rgba(20,22,27,0.05)" },
  statAccent: { background: "#FFF6DA", borderColor: colors.accentBorder },
  statLabel: { fontSize: 13, color: colors.textSoft, fontWeight: 600 },
  statValue: { fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: colors.text },
  statHint: { fontSize: 12.5, color: colors.textSoft },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 18 },
  btn: { minHeight: 42, padding: "0 16px", borderRadius: 999, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily },
  btnPrimary: { border: 0, background: colors.accent, color: colors.text },
  btnGhost: { border: `1px solid ${colors.borderStrong}`, background: colors.card, color: colors.text },
  arrowLink: { color: colors.text, fontWeight: 700, fontSize: 14, textDecoration: "none", whiteSpace: "nowrap" },
  pill: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 700, color: colors.textSoft, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${colors.borderSoft}`, whiteSpace: "nowrap" },
  td: { padding: "12px", borderBottom: `1px solid ${colors.borderSoft}`, color: colors.text, verticalAlign: "top" },
  muted: { color: colors.textSoft, fontSize: 13 },
  error: { background: "rgba(217,45,32,0.08)", border: "1px solid rgba(217,45,32,0.25)", color: colors.dangerSoft, padding: "10px 14px", borderRadius: 14, marginBottom: 16, fontSize: 14 },
  scroll: { overflowX: "auto" },
};
