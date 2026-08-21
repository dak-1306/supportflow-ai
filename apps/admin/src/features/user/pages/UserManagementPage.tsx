import React, { useState } from "react";
import {
  useUsersQuery,
  useCreateUserMutation,
} from "@/features/user/hooks/useUsers";
import { UserTable } from "@/features/user/components/UserTable";
import { CreateUserModal } from "@/features/user/components/CreateUserModal";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@supportflow/ui/src/components/ui/button";

const USER_MANAGEMENT_TEXTS = {
  title: "Quản lý Đội ngũ",
  description: "Danh sách thành viên trong Workspace",
  addUserBtn: "+ Thêm thành viên",
} as const;

export const UserManagementPage: React.FC = () => {
  const { data: users = [], isLoading } = useUsersQuery();
  const createUserMutation = useCreateUserMutation();
  const currentUser = useAuthStore((state) => state.user);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {USER_MANAGEMENT_TEXTS.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {USER_MANAGEMENT_TEXTS.description}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          {USER_MANAGEMENT_TEXTS.addUserBtn}
        </Button>
      </div>

      <UserTable
        users={users}
        isLoading={isLoading}
        currentUser={currentUser}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createUserMutation.mutateAsync}
        isLoading={createUserMutation.isPending}
        currentUserRole={currentUser?.role}
      />
    </div>
  );
};
