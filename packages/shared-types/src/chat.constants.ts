// packages/shared-types/src/chat.constants.ts
export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_WORKSPACE: "join_workspace",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",

  // Server -> Client / Bi-directional
  NEW_MESSAGE: "new_message",
  WORKSPACE_NEW_MESSAGE: "workspace_new_message",
  TYPING_STATUS: "typing_status",
  ADMIN_NOTIFICATION: "admin_notification",
  STATUS_CHANGED: "conversation_status_changed",
  ASSIGNED: "conversation_assigned",
} as const;

export const SOCKET_ROOMS = {
  CONVERSATION: (id: string) => `room_${id}`,
  WORKSPACE: (id: string) => `workspace_${id}`,
};

export const SYSTEM_MESSAGES = {
  ADMIN_JOINED: "Tư vấn viên đã tham gia cuộc hội thoại.",
  CONVERSATION_CLOSED: "Cuộc hội thoại đã được đóng.",
} as const;
