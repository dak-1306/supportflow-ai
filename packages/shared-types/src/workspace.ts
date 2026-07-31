export type WorkspaceStatus = "active" | "inactive";

export interface IWorkspaceAIConfig {
  provider: string;
  model: string;
  temperature: number;
  systemPrompt: string;
}

export interface IWorkspaceWidgetConfig {
  primaryColor: string;
  title: string;
  welcomeMessage: string;
  botName: string;
  botAvatar: string;
}

export interface IWorkspace {
  id: string;
  name: string;
  logo?: string;
  status: WorkspaceStatus;
  aiConfig: IWorkspaceAIConfig;
  widgetConfig: IWorkspaceWidgetConfig;
  embedScript?: string; // Trường này sẽ được trả về cho Frontend, nhưng không lưu trong DB
  createdAt: string | Date;
  updatedAt: string | Date;
}

// DTO cho thao tác Update Workspace
export type UpdateWorkspaceDto = Partial<
  Omit<IWorkspace, "id" | "createdAt" | "updatedAt">
>;
