// src/utils/config.ts
export const getWorkspaceId = (): string => {
  // 1. Lấy từ window.SupportFlowConfig do Script nhúng truyền vào
  const configWorkspaceId = window.SupportFlowConfig?.workspaceId;

  if (configWorkspaceId) {
    return configWorkspaceId;
  }

  // 2. Fallback cho môi trường Development khi bạn chạy test Widget độc lập
  if (import.meta.env.VITE_WORKSPACE_ID) {
    return import.meta.env.VITE_WORKSPACE_ID;
  }

  console.error(
    "[SupportFlow Widget] Không tìm thấy workspaceId! Hãy đảm bảo bạn đã khai báo window.SupportFlowConfig.",
  );
  return "";
};
