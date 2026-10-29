import React from "react";
import { redirect } from "next/navigation";
import { User, Lock, Download, Trash2, Shield, Bell } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileClientView } from "@/components/waitlist/ProfileClientView";

export const dynamic = "force-dynamic";

export default async function HoSoPage() {
  const session = await getSession();
  if (!session) {
    redirect("/dang-nhap?redirectTo=/ho-so");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      defaultChannel: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/dang-nhap");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Hồ sơ cá nhân & Cài đặt
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quản lý thông tin tài khoản, mật khẩu và dữ liệu cá nhân
        </p>
      </div>

      <ProfileClientView user={user} />
    </div>
  );
}
