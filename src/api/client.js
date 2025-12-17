import axios from "axios";

// --------------------------------------------------
// API BASE URL (ENV-driven)
// --------------------------------------------------
// Vite: usa import.meta.env
// Railway / produzione: VITE_API_BASE_URL
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // 15s: evita request bloccate
});

// --------------------------------------------------
// REQUEST INTERCEPTOR
// Aggiunge Authorization: Bearer <admin_token>
// SOLO se non è già presente
// --------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    if (!config.headers) {
      config.headers = {};
    }

    // Se Authorization è già impostato (es. partner), non toccare
    if (!config.headers.Authorization) {
      const adminToken = localStorage.getItem("vg_admin_token");
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------------------------------------
// RESPONSE INTERCEPTOR
// Gestione errori globali (401 admin)
// --------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Se token admin non valido / scaduto
    if (status === 401) {
      localStorage.removeItem("vg_admin_token");

      // Evita loop se siamo già nella login
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
