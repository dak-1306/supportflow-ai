import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import Login from "@/features/auth/pages/Login";
import ChatPage from "@/features/chat/pages/ChatPage";
import KnowledgeBasePage from "@/features/knowledge-base/pages/kb-page";
import RagTestPage from "@/features/rag/pages/RagTestPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { UserManagementPage } from "@/features/user/pages/UserManagementPage";

import AdminLayout from "@/layouts/AdminLayout";

// Nâng cấp ProtectedRoute hỗ trợ kiểm tra Role
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("owner" | "admin" | "agent")[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  // 1. Chưa đăng nhập -> Chuyển hướng về trang Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Đã đăng nhập nhưng Role không nằm trong danh sách được phép -> Chuyển về trang Chat
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Route công khai */}
      <Route path="/login" element={<Login />} />

      {/* Các Route Admin bọc trong AdminLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin"]}>
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin"]}>
            <AdminLayout>
              <UserManagementPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin", "agent"]}>
            <AdminLayout>
              <ChatPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/knowledge-base"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin"]}>
            <AdminLayout>
              <KnowledgeBasePage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/rag-test"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin"]}>
            <AdminLayout>
              <RagTestPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Điều hướng mặc định */}
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}
