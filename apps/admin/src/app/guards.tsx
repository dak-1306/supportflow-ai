import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "agent") return <Navigate to="/chat" replace />;
  return <Navigate to="/dashboard" replace />;
}

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
