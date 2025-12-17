// src/i18n/index.js
import it from "./it";
import en from "./en";

const DICTS = { it, en };
const FALLBACK_LANG = "it";
const STORAGE_KEY = "vg_partner_lang";
const EVENT_NAME = "vg:lang-changed";

function getByPath(obj, path) {
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
}

export function getLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && DICTS[saved]) return saved;
  return FALLBACK_LANG;
}

export function setLang(lang) {
  if (!DICTS[lang]) return;
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { lang } }));
}

export function onLangChange(cb) {
  const handler = (e) => cb?.(e?.detail?.lang);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export function t(key, vars = {}) {
  const lang = getLang();
  const dict = DICTS[lang] || DICTS[FALLBACK_LANG];

  let value = getByPath(dict, key);
  if (value == null) value = getByPath(DICTS[FALLBACK_LANG], key);

  if (typeof value !== "string") return key;

  return value.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] != null ? String(vars[k]) : `{${k}}`
  );
}
