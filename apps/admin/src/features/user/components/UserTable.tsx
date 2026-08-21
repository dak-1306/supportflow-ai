import React, { useState } from "react";
import { IUser, UserRole } from "@supportflow/shared-types";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Badge } from "@supportflow/ui/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@supportflow/ui/src/components/ui/table";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  useToggleUserStatusMutation,
  useDeleteUserMutation,
} from "@/features/user/hooks/useUsers";

interface UserTableProps {
  users: IUser[];
  isLoading: boolean;
  currentUser: IUser | null;
}

const TABLE_TEXTS = {
  headers: ["Thành viên", "Email", "Vai trò", "Trạng thái", "Thao tác"],
  loading: "Đang tải...",
  youTag: "(Bạn)",
  statusActive: "Hoạt động",
  statusLocked: "Đã khóa",
  actionLock: "Khóa",
  actionUnlock: "Mở khóa",
  actionDelete: "Xóa",
  deleteModal: {
    title: "Xác nhận xóa tài khoản",
    confirmText: "Xóa vĩnh viễn",
    description_text_first: "Bạn có chắc chắn muốn xóa thành viên",
    description_text_second: "Hành động này không thể hoàn tác.",
  },
} as const;

const getRoleBadgeClass = (role: UserRole) => {
  switch (role) {
    case "owner":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    case "admin":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    default:
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
  }
};

const canManageUser = (currentUser: IUser | null, targetUser: IUser) => {
  if (!currentUser || currentUser.id === targetUser.id) return false;
  if (targetUser.role === "owner") return false;
  if (currentUser.role === "admin" && targetUser.role === "admin") return false;
  return true;
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  currentUser,
}) => {
  const toggleStatusMutation = useToggleUserStatusMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setUserToDelete(null);
    } catch (error) {
      console.error("Lỗi xóa user:", error);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_TEXTS.headers.map((header, index) => (
                <TableHead
                  key={header}
                  className={index === 4 ? "text-right" : ""}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {TABLE_TEXTS.loading}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isActionAllowed = canManageUser(currentUser, user);
                const isActive = user.status === "active";
                const isTogglingThisUser =
                  toggleStatusMutation.isPending &&
                  toggleStatusMutation.variables === user.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}{" "}
                      {currentUser?.id === user.id && (
                        <span className="text-xs text-muted-foreground">
                          {TABLE_TEXTS.youTag}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRoleBadgeClass(user.role)}
                      >
                        {user.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          isActive ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? "bg-green-600" : "bg-red-500"
                          }`}
                        />
                        {isActive
                          ? TABLE_TEXTS.statusActive
                          : TABLE_TEXTS.statusLocked}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isActionAllowed ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStatusMutation.mutate(user.id)}
                            disabled={isTogglingThisUser}
                          >
                            {isActive
                              ? TABLE_TEXTS.actionLock
                              : TABLE_TEXTS.actionUnlock}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
                            onClick={() => setUserToDelete(user)}
                          >
                            {TABLE_TEXTS.actionDelete}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          ---
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {userToDelete && (
        <ConfirmModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={deleteUserMutation.isPending}
          variant="danger"
          title={TABLE_TEXTS.deleteModal.title}
          confirmText={TABLE_TEXTS.deleteModal.confirmText}
          description={
            <>
              {TABLE_TEXTS.deleteModal.description_text_first}{" "}
              <strong className="text-gray-900 dark:text-white">
                {userToDelete?.name} ({userToDelete?.email})
              </strong>
              ? {TABLE_TEXTS.deleteModal.description_text_second}
            </>
          }
        />
      )}
    </>
  );
};
