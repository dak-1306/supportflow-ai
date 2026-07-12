import React from "react";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>🎉 Chào mừng tới Admin Dashboard</h1>
      <p>
        Bạn đã đăng nhập thành công hệ thống bảo mật bằng JWT và Refresh Token.
      </p>
      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
          background: "#ff4d4f",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Đăng xuất
      </button>
    </div>
  );
}
