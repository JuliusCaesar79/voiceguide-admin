import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// --- ADMIN ---
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminPartnerDetail from "./pages/admin/AdminPartnerDetail";
import AdminPayouts from "./pages/admin/AdminPayouts";
import AdminPartnerRequests from "./pages/admin/AdminPartnerRequests";
import AdminCreateTrialLicense from "./pages/admin/AdminCreateTrialLicense";
import AdminTrialRequests from "./pages/admin/AdminTrialRequests";

import ProtectedRoute from "./components/ProtectedRoute";

const PARTNER_PORTAL_URL = "https://voiceguide-partner-production.up.railway.app";

// Il portale partner ora vive in un progetto separato: chi arriva qui con un
// vecchio link/segnalibro /partner/... viene mandato al nuovo sito invece di un 404.
function PartnerRedirect() {
  window.location.replace(PARTNER_PORTAL_URL + window.location.pathname);
  return null;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Root */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* -------------------------- */}
        {/*          ADMIN             */}
        {/* -------------------------- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payouts"
          element={
            <ProtectedRoute>
              <AdminPayouts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partner-requests"
          element={
            <ProtectedRoute>
              <AdminPartnerRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trial-requests"
          element={
            <ProtectedRoute>
              <AdminTrialRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/licenses/trial"
          element={
            <ProtectedRoute>
              <AdminCreateTrialLicense />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners"
          element={
            <ProtectedRoute>
              <AdminPartners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners/:id"
          element={
            <ProtectedRoute>
              <AdminPartnerDetail />
            </ProtectedRoute>
          }
        />

        {/* -------------------------- */}
        {/*          PARTNER           */}
        {/* -------------------------- */}
        {/* Il portale partner vive ora nel suo progetto: qualunque vecchio link
            /partner/... viene rimbalzato lì invece di dare 404. */}
        <Route path="/partner/*" element={<PartnerRedirect />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
