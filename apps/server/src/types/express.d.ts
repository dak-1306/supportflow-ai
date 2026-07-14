declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        workspaceId: string;
        role: "admin" | "agent";
      };
    }
  }
}

// Thêm dòng này để biến file thành một external module
export {};
