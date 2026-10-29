"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Bell,
  ArrowRight,
} from "lucide-react";
import {
  updateProfileAction,
  changePasswordAction,
  deleteAccountAction,
} from "@/app/actions/waitlist";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    defaultChannel: string;
    createdAt: Date | string;
  };
}

export function ProfileClientView({ user }: Props) {
  const router = useRouter();

  // Profile update state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Password update state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateProfileAction(formData);
      if (res.success) {
        setProfileMsg({ type: "success", text: "Cập nhật thông tin thành công!" });
        router.refresh();
      } else {
        setProfileMsg({ type: "error", text: res.error || "Không thể cập nhật thông tin." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Đã xảy ra lỗi kết nối." });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await changePasswordAction(formData);
      if (res.success) {
        setPasswordMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
        form.reset();
      } else {
        setPasswordMsg({ type: "error", text: res.error || "Đổi mật khẩu thất bại." });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Đã xảy ra lỗi kết nối." });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      const res = await deleteAccountAction();
      if (res.success) {
        router.push("/dang-nhap");
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Thông tin cá nhân */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Thông tin cơ bản
        </h2>

        {profileMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {profileMsg.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                name="name"
                defaultValue={user.name}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email (không thể thay đổi)
              </label>
              <input
                type="email"
                disabled
                defaultValue={user.email}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại (tùy chọn)
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={user.phone || ""}
                placeholder="0912345678"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kênh nhận thông báo mặc định
              </label>
              <select
                name="defaultChannel"
                defaultValue={user.defaultChannel}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="WEBSITE">Website (Trong ứng dụng)</option>
                <option value="SMS">SMS (Giả lập tin nhắn)</option>
                <option value="EMAIL">Email (Giả lập hộp thư)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Đổi mật khẩu */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-600" />
          Đổi mật khẩu
        </h2>

        {passwordMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              passwordMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {passwordMsg.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu mới (tối thiểu 8 ký tự)
              </label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={8}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              {passwordLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Xuất dữ liệu & Xóa tài khoản */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Quyền riêng tư & Quản lý dữ liệu
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-800">
              Xuất dữ liệu của tôi (JSON)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Tải về toàn bộ thông tin tài khoản, danh sách yêu cầu chờ và thông báo dạng JSON.
            </div>
          </div>
          <a
            href="/api/user/export"
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Tải về JSON
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-rose-50/50 rounded-xl border border-rose-200">
          <div>
            <div className="text-xs font-bold text-rose-900">
              Xóa tài khoản vĩnh viễn
            </div>
            <div className="text-[11px] text-rose-700 mt-0.5">
              Hành động này sẽ xóa toàn bộ tài khoản và các yêu cầu chờ vé liên quan khỏi cơ sở dữ liệu.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa tài khoản
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertCircle className="w-5 h-5" />
              <span>Xác nhận xóa tài khoản vĩnh viễn</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản <strong>{user.email}</strong> không? Toàn bộ các
              yêu cầu chờ vé và lịch sử thông báo của bạn sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                {deleteLoading ? "Đang xóa..." : "Xác nhận xóa tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
