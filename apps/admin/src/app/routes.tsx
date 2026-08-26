import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import { ProtectedRoute, PublicRoute, RootRedirect } from "./guards";
import AdminLayout from "@/layouts/AdminLayout";

// 🟢 Lazy Loading Pages
const Login = lazy(() => import("@/features/auth/pages/Login"));
const Register = lazy(() => import("@/features/auth/pages/Register"));
const OnboardingPage = lazy(
  () => import("@/features/workspace/pages/OnboardingPage"),
);

const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const UserManagementPage = lazy(() =>
  import("@/features/user/pages/UserManagementPage").then((m) => ({
    default: m.UserManagementPage,
  })),
);
const ChatPage = lazy(() => import("@/features/chat/pages/ChatPage"));
const KnowledgeBasePage = lazy(() =>
  import("@/features/knowledge-base/pages/kb-page").then((m) => ({
    default: m.KnowledgeBasePage,
  })),
);
const RagTestPage = lazy(() => import("@/features/rag/pages/RagTestPage"));
const WorkspaceSettingsPage = lazy(() =>
  import("@/features/workspace/pages/WorkspaceSettingsPage").then((m) => ({
    default: m.WorkspaceSettingsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/features/profile/pages/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);

const NotFoundPage = lazy(() => import("@/features/errors/pages/NotFoundPage"));
const ServerErrorPage = lazy(
  () => import("@/features/errors/pages/ServerErrorPage"),
);

export default function AppRoutes() {
  return (
    <Suspense>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* 🟢 Guest Routes: Đã login sẽ tự redirect về / */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* 🟢 Protected Admin Layout Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Tất cả Role */}
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Chỉ Owner & Admin */}
            <Route
              element={<ProtectedRoute allowedRoles={["owner", "admin"]} />}
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/team" element={<UserManagementPage />} />
              <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="/rag-test" element={<RagTestPage />} />
              <Route
                path="/workspace-settings"
                element={<WorkspaceSettingsPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* Error Pages */}
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
