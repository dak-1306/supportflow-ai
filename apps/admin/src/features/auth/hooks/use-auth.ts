import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../services/auth.api.ts"; // Hoặc đường dẫn services/ của bạn
import { useAuthStore } from "../../../stores/auth.store.ts"; // Hoặc đường dẫn store/ của bạn
import { useNavigate } from "react-router-dom";

export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: any) => AuthService.login(credentials),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      navigate("/dashboard");
    },
  });
};
