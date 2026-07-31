import React, { useState, useEffect } from "react";
import { User, CheckCircle2, AlertCircle } from "lucide-react";
import { useProfile } from "@/features/profile/hooks/useProfile";

export const ProfileInfoForm: React.FC = () => {
  const { user, updateProfile, isUpdating, updateError } = useProfile();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

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

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            URL Avatar
          </label>
          <input
            type="text"
            placeholder="https://example.com/avatar.png"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
        >
          {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
};
