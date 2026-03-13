import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { token, user, loading } = useAuth();

  if (loading) return null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireOwner && !user?.is_owner) {
    return <Navigate to="/register-barbershop" replace />;
  }

  return children;
};

export default ProtectedRoute;