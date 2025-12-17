import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute (ADMIN)
 * - Controlla se esiste il token admin nel localStorage
 * - Se sì: mostra children
 * - Se no: redirect /admin/login
 */
export default function ProtectedRoute({ children }) {
  const tokenKey = "vg_admin_token";
  const token = (localStorage.getItem(tokenKey) || "").trim();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
