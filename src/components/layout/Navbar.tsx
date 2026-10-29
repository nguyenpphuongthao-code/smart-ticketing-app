"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Train,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ClipboardList,
  PlusCircle,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface NavbarProps {
  user: SessionUser | null;
  unreadCount?: number;
}

export function Navbar({ user, unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-9 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                Chờ vé thông minh
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Smart Ticket Waitlist Demo
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/") && pathname === "/"
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/tim-chuyen"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/tim-chuyen")
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              Tìm chuyến
            </Link>
            <Link
              href="/gioi-thieu"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/gioi-thieu")
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              Giới thiệu
            </Link>

            {user && (
              <>
                <Link
                  href="/cho-ve/moi"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${
                    isActive("/cho-ve/moi")
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  Đăng ký chờ
                </Link>
                <Link
                  href="/yeu-cau"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${
                    isActive("/yeu-cau")
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Yêu cầu của tôi
                </Link>
              </>
            )}

            {user?.role === "STAFF" && (
              <Link
                href="/quan-tri"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${
                  isActive("/quan-tri")
                    ? "text-indigo-600 bg-indigo-50 font-semibold"
                    : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                Quản trị
              </Link>
            )}
          </nav>

          {/* Right Header: Notifications & Auth State */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <Link
                  href="/thong-bao"
                  className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors"
                  title="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown / Profile Link */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link
                    href="/ho-so"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    {user.role === "STAFF" && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                        Staff
                      </span>
                    )}
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/dang-nhap"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-md hover:bg-slate-50"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/dang-ky"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                href="/thong-bao"
                className="relative p-2 text-slate-600 hover:text-blue-600"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Trang chủ
          </Link>
          <Link
            href="/tim-chuyen"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Tìm chuyến
          </Link>
          <Link
            href="/gioi-thieu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Giới thiệu
          </Link>

          {user ? (
            <>
              <Link
                href="/cho-ve/moi"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-blue-50"
              >
                Đăng ký chờ vé mới
              </Link>
              <Link
                href="/yeu-cau"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Yêu cầu của tôi
              </Link>
              <Link
                href="/thong-bao"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Thông báo {unreadCount > 0 && `(${unreadCount} mới)`}
              </Link>
              <Link
                href="/ho-so"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Hồ sơ cá nhân ({user.name})
              </Link>
              {user.role === "STAFF" && (
                <Link
                  href="/quan-tri"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-semibold text-indigo-700 bg-indigo-50"
                >
                  Trang quản trị vận hành
                </Link>
              )}
              <div className="pt-2 border-t border-slate-200">
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full text-left px-3 py-2 text-red-600 font-medium rounded-md hover:bg-red-50"
                  >
                    Đăng xuất ({user.email})
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <Link
                href="/dang-nhap"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-medium"
              >
                Đăng nhập
              </Link>
              <Link
                href="/dang-ky"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium"
              >
                Đăng ký tài khoản
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
