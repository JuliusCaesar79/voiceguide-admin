// src/components/admin/modalStyles.js
// Stili condivisi per bottoni/campi dentro Modal.jsx (file separato per
// rispettare la regola di Fast Refresh: un file di componente esporta solo componenti).

import { colors } from "../../theme/adminTheme";

export const modalButtonStyles = {
  primary: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    background: colors.accentGradient,
    color: colors.accentButtonText,
    boxShadow: "0 12px 30px rgba(253,197,0,0.35)",
  },
  secondary: {
    padding: "10px 16px",
    borderRadius: 999,
    border: `1px solid ${colors.borderSoft}`,
    cursor: "pointer",
    fontWeight: 700,
    background: colors.bgDeep,
    color: colors.text,
  },
  danger: {
    padding: "10px 16px",
    borderRadius: 999,
    border: `1px solid rgba(239,68,68,0.35)`,
    cursor: "pointer",
    fontWeight: 800,
    background: "rgba(239,68,68,0.14)",
    color: colors.text,
  },
};

export const modalFieldStyles = {
  label: {
    display: "block",
    fontSize: "0.8rem",
    opacity: 0.8,
    marginBottom: "6px",
    color: colors.textSoft,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.bgDeep,
    color: colors.text,
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${colors.borderSoft}`,
    background: colors.bgDeep,
    color: colors.text,
    fontSize: "0.9rem",
    outline: "none",
    resize: "vertical",
    minHeight: 80,
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
};
