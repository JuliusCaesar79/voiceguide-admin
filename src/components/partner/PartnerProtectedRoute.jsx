// src/components/partner/PartnerProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * PartnerProtectedRoute
 * - Verifica presenza token partner
 * - Se assente → redirect /partner/login
 */
export default function PartnerProtectedRoute({ children }) {
  const tokenKey = "partner_token";
  const token = (localStorage.getItem(tokenKey) || "").trim();

  if (!token) {
    return <Navigate to="/partner/login" replace />;
  }

  return children;
}
