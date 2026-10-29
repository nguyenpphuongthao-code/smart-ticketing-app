"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Train, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { loginAction, quickLoginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (redirectTo) {
      formData.set("redirectTo", redirectTo);
    }

    try {
      const res = await loginAction(formData);
      if (res && !res.success) {
        setError(res.error || "Đăng nhập không thành công.");
      }
    } catch (err: any) {
      // Next.js redirect throws NEXT_REDIRECT, which is normal
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      setError("Đã xảy ra lỗi trong quá trình xử lý.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLogin(email: string) {
    setLoading(true);
    setError(null);
    try {
      await quickLoginAction(email, redirectTo);
    } catch (err: any) {
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      setError("Không thể đăng nhập bằng tài khoản demo này.");
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
            Đăng nhập hệ thống
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Hệ thống minh họa Chờ vé thông minh (Dữ liệu học thuật giả lập)
          </p>
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs space-y-2.5">
          <div className="flex items-center gap-1.5 font-semibold text-blue-900">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Đăng nhập nhanh với tài khoản Demo:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("nhanvien@demo.local")}
              className="px-2.5 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-1 text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Nhân viên điều hành</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("khach1@demo.local")}
              className="px-2.5 py-2 bg-white text-slate-800 border border-slate-300 rounded font-medium hover:bg-slate-100 transition text-[11px]"
            >
              Hành khách 1 (An)
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("khach2@demo.local")}
              className="px-2.5 py-2 bg-white text-slate-800 border border-slate-300 rounded font-medium hover:bg-slate-100 transition text-[11px]"
            >
              Hành khách 2 (Bình)
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("khach3@demo.local")}
              className="px-2.5 py-2 bg-white text-slate-800 border border-slate-300 rounded font-medium hover:bg-slate-100 transition text-[11px]"
            >
              Hành khách 3 (Cường)
            </button>
          </div>
          <p className="text-[11px] text-slate-500 italic text-center">
            * Mật khẩu chung cho tất cả tài khoản: <code>Demo@12345</code>
          </p>
        </div>

        {/* Standard Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  defaultValue="khach1@demo.local"
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  name="password"
                  required
                  defaultValue="Demo@12345"
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
              {loading ? "Đang xử lý..." : "Đăng nhập"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
            Chưa có tài khoản?{" "}
            <Link href="/dang-ky" className="text-blue-600 font-semibold hover:underline">
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
