export const KB_CONFIG = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ["pdf", "docx"] as const,
  POLLING_INTERVAL_MS: 4000,
} as const;

export const KB_UI_TEXT = {
  page: {
    title: "Cơ sở tri thức (Knowledge Base)",
    subtitle:
      "Tải lên tài liệu hướng dẫn hoặc quy định của doanh nghiệp để huấn luyện AI trợ giúp khách hàng tự động.",
    statsTotal: "Tài liệu hệ thống",
  },
  upload: {
    idleTitle: "Kéo & thả tài liệu vào đây, hoặc click để chọn",
    uploadingTitle: "Đang tải lên và phân tích tài liệu...",
    subtitle: "Hỗ trợ định dạng PDF, DOCX tối đa 10MB",
    selectButton: "Chọn tệp tin",
    supportedFormats: ["PDF", "DOCX"],
  },
  table: {
    cols: {
      name: "Tên tài liệu",
      type: "Định dạng",
      size: "Dung lượng",
      chunks: "Số đoạn (Chunks)",
      status: "Trạng thái",
      actions: "Thao tác",
    },
    emptyTitle: "Chưa có tài liệu tri thức nào",
    emptySubtitle:
      "Hãy tải lên tệp văn bản đầu tiên để huấn luyện AI bot của bạn.",
    status: {
      processing: "Đang xử lý",
      ready: "Sẵn sàng",
      failed: "Thất bại",
    },
  },
  modal: {
    deleteTitle: "Xác nhận xóa tài liệu",
    deleteConfirmText: "Xóa tài liệu",
    deleteWarning:
      "Hành động này không thể hoàn tác. Dữ liệu Vector liên quan đến tài liệu này sẽ bị hủy bỏ hoàn toàn khỏi hệ thống AI.",
  },
  toast: {
    invalidType: "Định dạng file không hợp lệ",
    invalidTypeDesc: "Hệ thống chỉ hỗ trợ tệp PDF và DOCX.",
    fileTooLarge: "Kích thước file vượt giới hạn",
    fileTooLargeDesc: `Dung lượng tệp tối đa cho phép là ${KB_CONFIG.MAX_FILE_SIZE_MB}MB.`,
    uploadSuccess: "Tải lên thành công",
    uploadSuccessDesc: "Tài liệu đã được tải lên và đưa vào hàng chờ xử lý.",
    deleteSuccess: "Đã xóa tài liệu",
    deleteSuccessDesc: "Dữ liệu tri thức đã được gỡ bỏ khỏi hệ thống.",
  },
} as const;
