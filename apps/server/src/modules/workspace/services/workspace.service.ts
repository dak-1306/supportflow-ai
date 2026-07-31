import { WorkspaceRepository } from "@/modules/workspace/repositories/workspace.repository";
import { IWorkspace, UpdateWorkspaceDto } from "@supportflow/shared-types";
import { AppError } from "@/shared/utils/app-error";

export class WorkspaceService {
  /**
   * Lấy thông tin chi tiết của Workspace theo ID
   */
  private workspaceRepository = new WorkspaceRepository();

  async getWorkspaceById(workspaceId: string): Promise<IWorkspace> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) throw new AppError("Workspace không tồn tại", 404);

    const cdnUrl =
      process.env.WIDGET_CDN_URL || "https://cdn.supportflow.com/widget.js";

    // Sinh động mã script dựa trên workspace.id
    const embedScript = `<script>
  window.SupportFlowConfig = { workspaceId: "${workspace.id}" };
</script>
<script async src="${cdnUrl}"></script>`;

    return {
      ...workspace,
      embedScript, // Trả kèm trường này cho Frontend
    };
  }

  /**
   * Cập nhật thông tin / cấu hình (AI, Widget) của Workspace
   */
  async updateWorkspace(
    workspaceId: string,
    updateData: UpdateWorkspaceDto,
  ): Promise<IWorkspace> {
    // Kiểm tra sự tồn tại trước khi update
    await this.getWorkspaceById(workspaceId);

    const updatedWorkspace = await this.workspaceRepository.update(
      workspaceId,
      updateData,
    );

    if (!updatedWorkspace) {
      throw new AppError("Không thể cập nhật Workspace.", 500);
    }

    return updatedWorkspace as IWorkspace;
  }

  /**
   * Lấy cấu hình công khai của Widget Chat cho Khách hàng (Client SDK)
   * Không yêu cầu xác thực JWT, chỉ lấy thông tin giao diện công khai
   */
  async getPublicWidgetConfig(workspaceId: string) {
    const workspace = await this.getWorkspaceById(workspaceId);

    if (workspace.status !== "active") {
      throw new AppError("Workspace hiện đang ngừng hoạt động.", 403);
    }

    return {
      workspaceId: workspace.id,
      name: workspace.name,
      logo: workspace.logo,
      widgetConfig: workspace.widgetConfig,
    };
  }

  async createDefaultWorkspace(workspaceName?: string): Promise<IWorkspace> {
    const name =
      workspaceName && workspaceName.trim() !== ""
        ? workspaceName.trim()
        : "Workspace của tôi";

    // Các giá trị aiConfig và widgetConfig sẽ tự lấy default từ Mongoose Schema
    const newWorkspace = await this.workspaceRepository.create({
      name: name,
    });

    if (!newWorkspace) {
      throw new AppError("Không thể khởi tạo Workspace.", 500);
    }

    return newWorkspace as IWorkspace;
  }
}

export const workspaceService = new WorkspaceService();
