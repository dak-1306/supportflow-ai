import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/features/auth/services/auth.api.ts"; // Hoặc đường dẫn services/ của bạn
import { useAuthStore } from "@/stores/auth.store.ts"; // Hoặc đường dẫn store/ của bạn
import { useNavigate } from "react-router-dom";
import { LoginFormValues, RegisterFormValues } from "@supportflow/shared-types";

export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginFormValues) =>
      AuthService.login(credentials),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response;
      setAuth(user, accessToken, refreshToken);
      navigate("/dashboard");
    },
  });
};

export const useRegisterMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: RegisterFormValues) =>
      AuthService.register(credentials),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response;
      setAuth(user, accessToken, refreshToken);
      navigate("/onboarding");
    },
  });
};
