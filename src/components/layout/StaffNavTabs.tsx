"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Activity,
  Train,
  History,
} from "lucide-react";

export function StaffNavTabs() {
  const pathname = usePathname();

  const navItems = [
    { href: "/quan-tri", label: "Tổng quan", icon: LayoutDashboard, exact: true },
    { href: "/quan-tri/yeu-cau", label: "Danh sách yêu cầu", icon: ClipboardList, exact: false },
    { href: "/quan-tri/phan-tich", label: "Phân tích nhu cầu", icon: BarChart3, exact: true },
    { href: "/quan-tri/kpi", label: "Chỉ số KPI", icon: Activity, exact: true },
    { href: "/quan-tri/chuyen", label: "Chuyến & Kho chỗ", icon: Train, exact: true },
    { href: "/quan-tri/nhat-ky", label: "Nhật ký hệ thống", icon: History, exact: true },
  ];

  const isTabActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-1 -mb-px">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isTabActive(item.href, item.exact);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              active
                ? "border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-indigo-600 hover:border-slate-300"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
