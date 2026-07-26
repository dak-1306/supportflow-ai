import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import Login from "../pages/Login";
import ChatPage from "../pages/ChatPage";
import KnowledgeBasePage from "../pages/kb-page";
import RagTestPage from "../pages/RagTestPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";

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
              <DashboardPage />
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
      <Route
        path="/rag-test"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <RagTestPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Điều hướng mặc định */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
