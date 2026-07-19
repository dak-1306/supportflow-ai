import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IUser } from "@supportflow/shared-types";

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  setAuth: (user: IUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false, // Để persist tự động quyết định dựa trên dữ liệu nạp vào
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage", // Tên key nằm dưới localStorage
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu các trường state này (bỏ qua hàm xử lý nếu muốn tối ưu dung lượng)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
