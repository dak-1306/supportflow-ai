import { Request, Response, NextFunction } from "express";
import { UserService } from "@/modules/user/services/user.service";
import { sendSuccess } from "@/shared/utils/api-response";

const userService = new UserService();

export class UserController {
  // Lấy thông tin cá nhân
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật thông tin cá nhân (tên, avatar)
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedUser = await userService.updateProfile(
        req.user!.id,
        req.body,
      );
      sendSuccess(res, updatedUser, "Cập nhật thông tin cá nhân thành công");
    } catch (error) {
      next(error);
    }
  }

  // Đổi mật khẩu
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.changePassword(req.user!.id, req.body);
      sendSuccess(res, null, "Đổi mật khẩu thành công");
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getWorkspaceUsers(
        req.user!.workspaceId,
        req.user!.role,
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
