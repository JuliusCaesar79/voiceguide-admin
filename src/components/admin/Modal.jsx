// src/components/admin/Modal.jsx
// Guscio condiviso per le finestre di conferma/modifica in stile VoiceGuide,
// al posto dei popup nativi del browser (window.confirm / window.prompt / alert).

import React, { useEffect } from "react";
import { colors } from "../../theme/adminTheme";

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = 480 }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{ ...styles.card, maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title ? <div style={styles.title}>{title}</div> : null}
        {subtitle ? <div style={styles.subtitle}>{subtitle}</div> : null}
        {children}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  card: {
    width: "100%",
    background: colors.card,
    border: `1px solid ${colors.accentBorder}`,
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
    maxHeight: "calc(100vh - 32px)",
    overflowY: "auto",
  },
  title: {
    fontSize: 17,
    fontWeight: 900,
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSoft,
  },
};
