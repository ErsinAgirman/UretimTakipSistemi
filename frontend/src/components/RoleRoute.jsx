// src/components/RoleRoute.jsx
//* eslint-disable react-refresh/only-export-components */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RoleRoute({ allowedRoles, children }) {
    const { role, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg">Yükleniyor...</p>
            </div>
        );
    }

    if (!role || !allowedRoles.includes(role)) {
        // Yetkiniz yoksa dashboard'a geri yönlendir
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
