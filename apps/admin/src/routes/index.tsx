import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ChatPage from "../pages/ChatPage";
import KnowledgeBasePage from "../pages/kb-page";
import AdminLayout from "../layouts/AdminLayout";

// Component bảo vệ Route bằng JWT
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Route công khai không dùng Layout Admin */}
      <Route path="/login" element={<Login />} />

      {/* Toàn bộ các Route Admin được bảo vệ bởi ProtectedRoute & bọc trong AdminLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ChatPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/knowledge-base"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <KnowledgeBasePage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Điều hướng mặc định */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
