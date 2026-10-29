"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Clock, ArrowRight, Mail, MessageSquare, Globe } from "lucide-react";
import { formatDateTimeVN } from "@/lib/utils";
import { markNotificationReadAction } from "@/app/actions/waitlist";

interface Props {
  notif: {
    id: string;
    message: string;
    channel: string;
    simulated: boolean;
    readAt: Date | string | null;
    createdAt: Date | string;
    request?: {
      code: string;
    } | null;
  };
}

export function NotificationItemView({ notif }: Props) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);
  const isRead = !!notif.readAt;

  async function handleMarkRead() {
    if (isRead || marking) return;
    setMarking(true);
    try {
      await markNotificationReadAction(notif.id);
      router.refresh();
    } finally {
      setMarking(false);
    }
  }

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case "EMAIL":
        return <Mail className="w-3.5 h-3.5" />;
      case "SMS":
        return <MessageSquare className="w-3.5 h-3.5" />;
      default:
        return <Globe className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={`border rounded-xl p-4 sm:p-5 transition shadow-sm ${
        isRead
          ? "bg-white border-slate-200"
          : "bg-blue-50/40 border-blue-200 hover:bg-blue-50/70"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
              {getChannelIcon(notif.channel)}
              <span>Kênh: {notif.channel} (giả lập)</span>
            </span>

            {!isRead && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                Chưa đọc
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            {notif.message}
          </p>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Gửi lúc: {formatDateTimeVN(notif.createdAt)}</span>
            {isRead && (
              <span>• Đã đọc: {formatDateTimeVN(notif.readAt)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {!isRead && (
            <button
              type="button"
              disabled={marking}
              onClick={handleMarkRead}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              Đánh dấu đã đọc
            </button>
          )}

          {notif.request && (
            <Link
              href={`/yeu-cau/${notif.request.code}`}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              Xem yêu cầu <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
