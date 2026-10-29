import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, CheckCheck, Clock, ArrowRight, AlertCircle, Mail, MessageSquare, Globe } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTimeVN } from "@/lib/utils";
import { NotificationItemView } from "@/components/waitlist/NotificationItemView";

export const dynamic = "force-dynamic";

export default async function ThongBaoPage() {
  const user = await getSession();
  if (!user) {
    redirect("/dang-nhap?redirectTo=/thong-bao");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    include: {
      request: {
        select: { code: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Trung tâm thông báo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Toàn bộ thông báo từ hệ thống (kênh giả lập: Website, SMS, Email)
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Chưa có thông báo nào
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Khi có vé phù hợp hoặc cập nhật trạng thái từ nhân viên điều hành, thông báo sẽ xuất
            hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <NotificationItemView key={notif.id} notif={notif} />
          ))}
        </div>
      )}
    </div>
  );
}
