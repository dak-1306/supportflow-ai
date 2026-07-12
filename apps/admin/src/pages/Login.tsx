import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginMutation } from "../features/auth/hooks/use-auth.ts";

import { Button } from "@supportflow/ui/src/components/ui/button"; // Import thẳng component cụ thể

// Định nghĩa validation schema bằng Zod đồng bộ với Backend
const loginSchema = z.object({
  email: z.string().email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu phải tối thiểu 6 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const serverError = loginMutation.error as any;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          width: 320,
          padding: 24,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        <h2>SupportFlow Admin</h2>

        {/* Error State từ Server */}
        {loginMutation.isError && (
          <p style={{ color: "red", fontSize: "14px" }}>
            {serverError?.response?.data?.message || "Đăng nhập thất bại"}
          </p>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: "14px", fontWeight: "bold" }}>Email</label>
          <input
            type="email"
            {...register("email")}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              boxSizing: "border-box",
            }}
          />
          {/* Validation Error từ Client */}
          {errors.email && (
            <p style={{ color: "red", fontSize: "12px", margin: "4px 0 0" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "14px", fontWeight: "bold" }}>
            Mật khẩu
          </label>
          <input
            type="password"
            {...register("password")}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 4,
              boxSizing: "border-box",
            }}
          />
          {/* Validation Error từ Client */}
          {errors.password && (
            <p style={{ color: "red", fontSize: "12px", margin: "4px 0 0" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        <Button disabled={loginMutation.isPending}>
          {/* Loading State */}
          {loginMutation.isPending ? "Đang xử lý..." : "Đăng nhập"}
        </Button>
      </form>
    </div>
  );
}
