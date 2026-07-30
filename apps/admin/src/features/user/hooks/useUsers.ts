import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/features/user/services/user.api";
import { CreateUserDto } from "@supportflow/shared-types";

export const USER_QUERY_KEYS = {
  users: ["users"] as const,
};

export const useUsers = () => {
  const queryClient = useQueryClient();

  // Query: Lấy danh sách thành viên
  const usersQuery = useQuery({
    queryKey: USER_QUERY_KEYS.users,
    queryFn: userApi.getUsers,
  });

  // Mutation: Tạo thành viên mới
  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserDto) => userApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.users });
    },
  });

  // Mutation: Đổi trạng thái (Bật/Khóa)
  const toggleStatusMutation = useMutation({
    mutationFn: (userId: string) => userApi.toggleStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.users });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.users });
    },
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    createUser: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
    deleteUser: deleteUserMutation.mutateAsync,
    isDeleting: deleteUserMutation.isPending,
  };
};
