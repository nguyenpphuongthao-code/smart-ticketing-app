import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldAlert,
  BarChart3,
  ClipboardList,
  Activity,
  Train,
  History,
  LayoutDashboard,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { StaffNavTabs } from "@/components/layout/StaffNavTabs";

export const dynamic = "force-dynamic";

export default async function QuanTriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/dang-nhap?redirectTo=/quan-tri");
  }

  if (user.role !== "STAFF") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-rose-200 rounded-2xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <UserX className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Quyền truy cập bị từ chối</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Khu vực này chỉ dành riêng cho <strong>Nhân viên điều hành đường sắt (STAFF)</strong>.
          Tài khoản hiện tại của bạn là hành khách thông thường.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-block"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-100/60 pb-12">
      {/* Staff Header Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                  <span>Trung tâm Điều hành & Phân tích Nhu cầu</span>
                  <span className="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                    Staff Portal
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  Hỗ trợ lập kế hoạch vận hành dựa trên dữ liệu nhu cầu chưa được đáp ứng (Giả lập)
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Nhân sự: <strong className="text-slate-800">{user.name}</strong> ({user.email})
            </div>
          </div>

          {/* Navigation Tabs */}
          <StaffNavTabs />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">{children}</div>
    </div>
  );
}
