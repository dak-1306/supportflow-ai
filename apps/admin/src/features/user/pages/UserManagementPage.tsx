import React, { useState } from "react";
import { useUsers } from "@/features/user/hooks/useUsers";
import { CreateUserModal } from "@/features/user/components/CreateUserModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useAuthStore } from "@/stores/auth.store";
import { IUser } from "@supportflow/shared-types";

export const UserManagementPage: React.FC = () => {
  const {
    users,
    isLoading,
    createUser,
    isCreating,
    toggleStatus,
    deleteUser,
    isDeleting,
  } = useUsers();
  const currentUser = useAuthStore((state) => state.user);

  // States quản lý Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null); // Quản lý user đang chọn để xóa

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    }
  };

  // Hàm xác nhận xóa
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(null); // Đóng dialog sau khi xóa xong
    } catch (error) {
      console.error("Lỗi xóa user:", error);
    }
  };

  // Kiểm tra quyền thao tác nút Xóa/Khóa
  const canManageUser = (targetUser: IUser) => {
    // Không thể thao tác lên chính mình
    if (currentUser?.id === targetUser.id) return false;
    // Không ai được thao tác lên Owner
    if (targetUser.role === "owner") return false;
    // Admin không được thao tác lên Admin khác
    if (currentUser?.role === "admin" && targetUser.role === "admin")
      return false;

    return true;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Đội ngũ
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Danh sách thành viên trong Workspace
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Thêm thành viên
        </button>
      </div>

      {/* Bảng danh sách */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3">Thành viên</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Vai trò</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isActionAllowed = canManageUser(user);

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {user.name} {currentUser?.id === user.id && "(Bạn)"}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadge(
                          user.role,
                        )}`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          user.status === "active"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "active"
                              ? "bg-green-600"
                              : "bg-red-500"
                          }`}
                        />
                        {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isActionAllowed ? (
                        <>
                          <button
                            onClick={() => toggleStatus(user.id)}
                            className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {user.status === "active" ? "Khóa" : "Mở khóa"}
                          </button>
                          <button
                            onClick={() => setUserToDelete(user)} // Mở dialog xác nhận xóa
                            className="ml-3 text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                          >
                            Xóa
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">---</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo User */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createUser}
        isLoading={isCreating}
        currentUserRole={currentUser?.role}
      />

      {/* Confirmation Dialog Xóa User */}
      {userToDelete && (
        <ConfirmModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          variant="danger"
          title="Xác nhận xóa tài khoản"
          confirmText="Xóa vĩnh viễn"
          description={
            <>
              Bạn có chắc chắn muốn xóa thành viên{" "}
              <strong className="text-gray-900 dark:text-white">
                {userToDelete?.name} ({userToDelete?.email})
              </strong>
              ? Hành động này không thể hoàn tác.
            </>
          }
        />
      )}
    </div>
  );
};
