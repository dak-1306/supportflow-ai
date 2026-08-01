// src/types/global.d.ts
declare global {
  interface Window {
    SupportFlowConfig?: {
      workspaceId: string;
      apiUrl?: string;
    };
  }
}

export {};
