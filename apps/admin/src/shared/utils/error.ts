// utils/error.ts
export const getErrorMessage = (error: any, fallback = "Đã có lỗi xảy ra!") => {
  return error?.response?.data?.message || error?.message || fallback;
};
