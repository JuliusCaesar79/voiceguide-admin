// src/theme/adminTheme.js
// Restyle 2026-10: stile chiaro come il sito nuovo (fondo crema, schede
// bianche, giallo VoiceGuide). Le chiavi restano quelle di prima, così tutte
// le pagine prendono i colori nuovi senza toccarle una per una.

export const colors = {
  // Brand
  accent: "#FFC226", // giallo VoiceGuide
  accentSoft: "rgba(255,194,38,0.18)",
  accentBorder: "rgba(214,158,0,0.45)",
  accentStrongBorder: "rgba(214,158,0,0.75)",

  // Sfondi
  bg: "#FBF8F1", // fondo crema dell'app
  bgDeep: "#F5EFE2", // campi, righe e riquadri interni
  card: "#FFFFFF",

  // Testo
  text: "#14161B",
  textMuted: "#4A4F5A",
  textSoft: "#5A5F6B",

  // Bordi & linee
  borderSoft: "rgba(20,22,27,0.10)",
  borderStrong: "rgba(20,22,27,0.18)",

  // Stati
  danger: "#D92D20",
  dangerSoft: "#B42318",
  success: "#12805C",
  successSoft: "#0E6B4C",

  // Bottoni primari (giallo)
  accentGradient: "linear-gradient(135deg, #FFC226, #FFD45C)",
  accentButtonText: "#14161B",
};

export const fontFamily = "Sora, system-ui, -apple-system, 'Segoe UI', sans-serif";
