"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Train, Lock, Mail, User, Phone, Bell, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<"PASSENGER" | "STAFF">("PASSENGER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("accountType", accountType);

    try {
      const res = await registerAction(formData);
      if (res && !res.success) {
        setError(res.error || "Đăng ký không thành công.");
      }
    } catch (err: any) {
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      setError("Đã xảy ra lỗi trong quá trình xử lý.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div
            className={`mx-auto w-12 h-12 text-white rounded-xl flex items-center justify-center shadow-md transition-colors ${accountType === "STAFF" ? "bg-indigo-600" : "bg-blue-600"
              }`}
          >
            {accountType === "STAFF" ? (
              <ShieldCheck className="w-7 h-7" />
            ) : (
              <Train className="w-7 h-7" />
            )}
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
            {accountType === "STAFF"
              ? "Đăng ký tài khoản quản trị"
              : "Đăng ký tài khoản hành khách"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {accountType === "STAFF"
              ? "Yêu cầu mã mời quản trị hợp lệ từ ban điều hành hệ thống"
              : "Tạo tài khoản để theo dõi nhu cầu chờ vé minh họa"}
          </p>
        </div>

        {/* Account Type Selector (Segmented Control / Radio Cards) */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <div
            role="radiogroup"
            aria-label="Chọn loại tài khoản đăng ký"
            className="grid grid-cols-2 gap-1.5"
          >
            <label
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition select-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1 ${accountType === "PASSENGER"
                  ? "border-blue-600 bg-blue-50 text-blue-900 shadow-xs"
                  : "border-transparent bg-transparent text-slate-600 hover:bg-slate-50"
                }`}
            >
              <input
                type="radio"
                name="accountTypeSelector"
                value="PASSENGER"
                checked={accountType === "PASSENGER"}
                onChange={() => setAccountType("PASSENGER")}
                className="sr-only"
                aria-label="Loại tài khoản Hành khách"
              />
              <User className="w-4 h-4 text-blue-600" />
              <span>Hành khách</span>
            </label>

            <label
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition select-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1 ${accountType === "STAFF"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs"
                  : "border-transparent bg-transparent text-slate-600 hover:bg-slate-50"
                }`}
            >
              <input
                type="radio"
                name="accountTypeSelector"
                value="STAFF"
                checked={accountType === "STAFF"}
                onChange={() => setAccountType("STAFF")}
                className="sr-only"
                aria-label="Loại tài khoản Quản trị hoặc Nhân viên điều hành"
              />
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="truncate">Quản trị / Nhân viên điều hành</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="accountType" value={accountType} />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={
                    accountType === "STAFF"
                      ? "Ví dụ: Trần Điều Hành (giả lập)"
                      : "Ví dụ: Nguyễn Văn A (giả lập)"
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={
                    accountType === "STAFF"
                      ? "dieuhanh@demo.local"
                      : "name@example.com"
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Extra required field for STAFF */}
            {accountType === "STAFF" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mã mời quản trị</span>
                  <span className="text-[11px] text-indigo-600 font-normal">Bắt buộc đối với Quản trị</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    name="inviteCode"
                    required
                    placeholder="Nhập mã mời do quản trị viên cấp"
                    aria-label="Mã mời quản trị"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-indigo-50/20"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Chỉ người có mã mời hợp lệ mới được kích hoạt quyền điều hành.
                </p>
              </div>
            )}

            {/* Passenger-only fields */}
            {accountType === "PASSENGER" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại (tùy chọn)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="0912345678"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kênh nhận thông báo mặc định (giả lập)
                  </label>
                  <div className="relative">
                    <Bell className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      name="defaultChannel"
                      defaultValue="WEBSITE"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="WEBSITE">Website (Thông báo trong ứng dụng)</option>
                      <option value="EMAIL">Email (Giả lập hộp thư)</option>
                      <option value="SMS">SMS (Giả lập tin nhắn)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu (tối thiểu 8 ký tự)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 transition ${accountType === "STAFF"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading
                ? "Đang tạo tài khoản..."
                : accountType === "STAFF"
                  ? "Đăng ký tài khoản quản trị"
                  : "Đăng ký tài khoản hành khách"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
            Đã có tài khoản?{" "}
            <a href="/dang-nhap" className="text-blue-600 font-semibold hover:underline cursor-pointer">
              Đăng nhập ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
