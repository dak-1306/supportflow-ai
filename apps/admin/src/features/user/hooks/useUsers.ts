import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/features/user/services/user.api";
import { CreateUserDto } from "@supportflow/shared-types";

export const USER_QUERY_KEYS = {
  users: ["users"] as const,
};

// 1. Hook lấy danh sách người dùng
export const useUsersQuery = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.users,
    queryFn: userApi.getUsers,
  });
};

// 2. Hook tạo người dùng mới
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserDto) => userApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.users });
    },
  });
};

// 3. Hook đổi trạng thái (Khóa / Mở khóa)
export const useToggleUserStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.toggleStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.users });
    },
  });
};

// 4. Hook xóa người dùng
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.users });
    },
  });
};
