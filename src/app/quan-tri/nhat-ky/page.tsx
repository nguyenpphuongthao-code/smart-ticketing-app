import React from "react";
import { History, Shield, Clock, User, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { formatDateTimeVN } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QuanTriNhatKyPage() {
  await requireStaff();

  const auditLogs = await prisma.auditLog.findMany({
    include: {
      actor: {
        select: { name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Nhật ký hệ thống (AuditLog)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch sử toàn bộ các tác vụ thay đổi dữ liệu, chuyển trạng thái và cập nhật kho vé
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-40">Thời gian</th>
                <th className="py-3 px-4 w-48">Người thực hiện</th>
                <th className="py-3 px-4 w-44">Hành động</th>
                <th className="py-3 px-4 w-36">Thực thể</th>
                <th className="py-3 px-4">Dữ liệu trước (Before)</th>
                <th className="py-3 px-4">Dữ liệu sau (After)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-sans">
                    Chưa có bản ghi nhật ký nào.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-500 font-sans">
                      {formatDateTimeVN(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-900">{log.actor.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {log.actor.email} ({log.actor.role})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-block">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">
                      <div>{log.entity}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        ID: {log.entityId}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs break-all">
                      {log.before || "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold max-w-xs break-all">
                      {log.after || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
