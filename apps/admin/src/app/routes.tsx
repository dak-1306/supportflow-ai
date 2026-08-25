import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import Login from "@/features/auth/pages/Login";
import ChatPage from "@/features/chat/pages/ChatPage";
import { KnowledgeBasePage } from "@/features/knowledge-base/pages/kb-page";
import RagTestPage from "@/features/rag/pages/RagTestPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { UserManagementPage } from "@/features/user/pages/UserManagementPage";

import AdminLayout from "@/layouts/AdminLayout";
import { WorkspaceSettingsPage } from "@/features/workspace/pages/WorkspaceSettingsPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import Register from "@/features/auth/pages/Register";
import OnboardingPage from "@/features/workspace/pages/OnboardingPage";
import NotFoundPage from "@/features/errors/pages/NotFoundPage";
import ServerErrorPage from "@/features/errors/pages/ServerErrorPage";

// Nâng cấp ProtectedRoute hỗ trợ kiểm tra Role
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("owner" | "admin" | "agent")[];
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  // 1. Chưa đăng nhập -> Chuyển hướng sang Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu là Agent -> Chuyển thẳng tới trang Chat (nơi làm việc chính)
  if (user?.role === "agent") {
    return <Navigate to="/chat" replace />;
  }

  // 3. Nếu là Owner / Admin -> Chuyển tới Dashboard
  return <Navigate to="/dashboard" replace />;
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
      {/* Route gốc điều hướng thông minh */}
      <Route path="/" element={<RootRedirect />} />
      {/* Route công khai */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

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

      <Route
        path="/workspace-settings"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin"]}>
            <AdminLayout>
              <WorkspaceSettingsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["owner", "admin", "agent"]}>
            <AdminLayout>
              <ProfilePage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Error Pages */}
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
