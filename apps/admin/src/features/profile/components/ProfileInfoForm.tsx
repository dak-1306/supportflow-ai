import React, { useState, useEffect, useRef } from "react";
import {
  User,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useUploadImageMutation } from "@/shared/hooks/useUpload";

export const ProfileInfoForm: React.FC = () => {
  const { user, updateProfile, isUpdating, updateError } = useProfile();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [success, setSuccess] = useState(false);

  // 🟢 Khởi tạo Ref và Mutation Hook cho Upload Ảnh
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImageMutation();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  // 🟢 Hàm xử lý khi chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImageMutation.mutate(file, {
      onSuccess: (data) => {
        // Lưu URL từ Cloudinary trả về vào state avatar
        setAvatar(data.url);
      },
    });

    // Reset input file để có thể chọn lại cùng 1 file nếu muốn
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🟢 Hàm xoá ảnh đại diện hiện tại
  const handleRemoveAvatar = () => {
    setAvatar("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    try {
      await updateProfile({ name, avatar });
      setSuccess(true);
    } catch {
      // Error đã được xử lý từ hook
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <User className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-slate-800">Thông tin cá nhân</h2>
      </div>

      {success && (
        <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Cập nhật thông tin thành công!
        </div>
      )}

      {updateError && (
        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {updateError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Email (Cố định)
          </label>
          <input
            type="email"
            disabled
            value={user?.email || ""}
            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Họ và Tên
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* 🟢 Khu vực Upload Avatar mới thay thế cho input text cũ */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Ảnh đại diện
          </label>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-400" />
              )}

              {/* Loading Spinner khi đang upload */}
              {uploadImageMutation.isPending && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploadImageMutation.isPending}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImageMutation.isPending}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadImageMutation.isPending
                    ? "Đang tải..."
                    : "Tải ảnh mới"}
                </button>

                {avatar && !uploadImageMutation.isPending && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Xóa ảnh
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Chấp nhận PNG, JPG, WEBP (Tối đa 2MB).
              </p>
            </div>
          </div>

          {/* Hiển thị lỗi nếu upload thất bại */}
          {uploadImageMutation.isError && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {uploadImageMutation.error.message || "Tải ảnh thất bại."}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isUpdating || uploadImageMutation.isPending}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
        >
          {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
};
