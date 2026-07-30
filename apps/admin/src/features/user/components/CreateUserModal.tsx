import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, CreateUserDto } from "@supportflow/shared-types"; // Import từ package validation

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateUserDto) => Promise<unknown>;
  isLoading: boolean;
  currentUserRole?: "owner" | "admin" | "agent";
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  currentUserRole,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserDto>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "agent",
    },
  });

  // Tự động reset form mỗi khi Modal mở ra
  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        email: "",
        password: "",
        role: "agent",
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: CreateUserDto) => {
    try {
      await onSubmit(data); // Đợi API tạo thành công
      reset(); // Reset form
      onClose(); // Sau đó mới đóng Modal
    } catch (error) {
      // Nếu API lỗi thì giữ nguyên Modal để user xem thông báo lỗi
      console.error("Lỗi tạo user:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Click ngoài lề để đóng modal */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Thêm thành viên mới
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Họ và tên
            </label>
            <input
              type="text"
              {...register("name")}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Nguyễn Văn A"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="user@supportflow.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mật khẩu
            </label>
            <input
              type="password"
              {...register("password")}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Vai trò */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vai trò
            </label>
            <select
              {...register("role")}
              disabled={isLoading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="agent">Agent (Tư vấn viên)</option>
              {currentUserRole === "owner" && (
                <option value="admin">Admin (Quản trị viên)</option>
              )}
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
