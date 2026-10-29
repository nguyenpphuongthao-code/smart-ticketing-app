"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Train, Lock, Mail, User, Phone, Bell, ArrowRight } from "lucide-react";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
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
          <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
            <Train className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
            Đăng ký tài khoản hành khách
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tạo tài khoản để theo dõi nhu cầu chờ vé minh họa
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Ví dụ: Nguyễn Văn A (giả lập)"
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
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

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
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 transition"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
            Đã có tài khoản?{" "}
            <Link href="/dang-nhap" className="text-blue-600 font-semibold hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
