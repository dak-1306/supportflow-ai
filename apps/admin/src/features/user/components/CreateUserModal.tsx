import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, CreateUserDto } from "@supportflow/shared-types";

import { Button } from "@supportflow/ui/src/components/ui/button";
import { Input } from "@supportflow/ui/src/components/ui/input";
import { PasswordField } from "@/shared/components/PasswordField";
import { FormAlert } from "@/shared/components/form-alert";
import { Label } from "@supportflow/ui/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@supportflow/ui/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@supportflow/ui/src/components/ui/select";
import { getErrorMessage } from "@/shared/utils/error";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateUserDto) => Promise<unknown>;
  isLoading: boolean;
  currentUserRole?: "owner" | "admin" | "agent";
}

const CREATE_USER_TEXTS = {
  title: "Thêm thành viên mới",
  labels: {
    name: "Họ và tên",
    email: "Email",
    password: "Mật khẩu",
    role: "Vai trò",
  },
  placeholders: {
    name: "Nguyễn Văn A",
    email: "user@supportflow.com",
    password: "••••••••",
    selectRole: "Chọn vai trò",
  },
  roles: {
    agent: "Agent (Tư vấn viên)",
    admin: "Admin (Quản trị viên)",
  },
  buttons: {
    cancel: "Hủy",
    submitLoading: "Đang xử lý...",
    submit: "Tạo tài khoản",
  },
} as const;

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
    control,
    setError,
    clearErrors,
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

  useEffect(() => {
    if (isOpen) {
      reset({ name: "", email: "", password: "", role: "agent" });
      clearErrors();
    }
  }, [isOpen, reset, clearErrors]);

  const handleFormSubmit = async (data: CreateUserDto) => {
    try {
      clearErrors("root");
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      setError("root", {
        type: "manual",
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{CREATE_USER_TEXTS.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {errors.root && (
            <FormAlert type="error" message={getErrorMessage(errors.root)} />
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">{CREATE_USER_TEXTS.labels.name}</Label>
            <Input
              id="name"
              type="text"
              disabled={isLoading}
              placeholder={CREATE_USER_TEXTS.placeholders.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">
                {getErrorMessage(errors.name)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{CREATE_USER_TEXTS.labels.email}</Label>
            <Input
              id="email"
              type="email"
              disabled={isLoading}
              placeholder={CREATE_USER_TEXTS.placeholders.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">
                {getErrorMessage(errors.email)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              {CREATE_USER_TEXTS.labels.password}
            </Label>
            <PasswordField
              id="password"
              disabled={isLoading}
              placeholder={CREATE_USER_TEXTS.placeholders.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">
                {getErrorMessage(errors.password)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">{CREATE_USER_TEXTS.labels.role}</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger id="role">
                    <SelectValue
                      placeholder={CREATE_USER_TEXTS.placeholders.selectRole}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">
                      {CREATE_USER_TEXTS.roles.agent}
                    </SelectItem>
                    {currentUserRole === "owner" && (
                      <SelectItem value="admin">
                        {CREATE_USER_TEXTS.roles.admin}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-xs text-red-500">
                {getErrorMessage(errors.role)}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {CREATE_USER_TEXTS.buttons.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? CREATE_USER_TEXTS.buttons.submitLoading
                : CREATE_USER_TEXTS.buttons.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
