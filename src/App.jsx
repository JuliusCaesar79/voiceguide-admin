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

// --- PARTNER ---
import PartnerLogin from "./pages/partner/PartnerLogin";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerOrders from "./pages/partner/PartnerOrders";
import PartnerProtectedRoute from "./components/partner/PartnerProtectedRoute";

function App() {
  const defaultRedirect = () => {
    const path = window.location.pathname || "";
    if (path.startsWith("/partner")) return "/partner/login";
    if (path.startsWith("/admin")) return "/admin/login";
    return "/admin/login";
  };

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
        <Route path="/partner/login" element={<PartnerLogin />} />

        <Route
          path="/partner/dashboard"
          element={
            <PartnerProtectedRoute>
              <PartnerDashboard />
            </PartnerProtectedRoute>
          }
        />
        <Route
          path="/partner/orders"
          element={
            <PartnerProtectedRoute>
              <PartnerOrders />
            </PartnerProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={defaultRedirect()} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
