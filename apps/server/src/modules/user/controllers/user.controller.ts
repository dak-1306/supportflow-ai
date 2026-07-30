import { Request, Response, NextFunction } from "express";
import { UserService } from "@/modules/user/services/user.service";
import { sendSuccess } from "@/shared/utils/api-response";

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getWorkspaceUsers(
        req.user!.workspaceId,
        req.user!.role, // Truyền role để lọc
      );
      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const newUser = await userService.createUser(
        req.user!.role,
        req.user!.workspaceId,
        req.body,
      );
      console.log("New user created:", newUser);
      sendSuccess(res, newUser, "Tạo tài khoản thành công");
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedUser = await userService.toggleUserStatus(
        req.user!.role,
        req.params.id,
        req.user!.workspaceId,
      );
      sendSuccess(res, updatedUser, "Cập nhật trạng thái thành công");
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUser(
        req.user!.id,
        req.user!.role,
        req.params.id,
        req.user!.workspaceId,
      );
      sendSuccess(res, null, "Xóa tài khoản thành công");
    } catch (error) {
      next(error);
    }
  }
}
