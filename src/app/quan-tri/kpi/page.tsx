import React from "react";
import { Activity, Info, TrendingUp, BarChart2, ShieldCheck, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { buildKpiMetricsList, type KpiRawData } from "@/lib/kpi";

export const dynamic = "force-dynamic";

export default async function QuanTriKpiPage() {
  await requireStaff();

  // 1. Analytics events
  const [formStartedCount, requestCreatedCount] = await Promise.all([
    prisma.analyticsEvent.count({ where: { type: "form_started" } }),
    prisma.analyticsEvent.count({ where: { type: "request_created" } }),
  ]);

  // 2. Matched & Converted
  const [matchedRequestsCount, convertedRequestsCount] = await Promise.all([
    prisma.waitRequest.count({
      where: {
        OR: [{ status: "Có vé phù hợp" }, { notifiedAt: { not: null } }],
      },
    }),
    prisma.waitRequest.count({
      where: { convertedAt: { not: null } },
    }),
  ]);

  // 3. Notification response time
  const notificationsWithRead = await prisma.notification.findMany({
    where: {
      readAt: { not: null },
    },
    select: {
      createdAt: true,
      readAt: true,
    },
  });

  const readDurationMinutesList: number[] = [];
  for (const n of notificationsWithRead) {
    if (n.readAt) {
      const diffMs = new Date(n.readAt).getTime() - new Date(n.createdAt).getTime();
      const minutes = Math.max(0, Math.round(diffMs / (1000 * 60)));
      readDurationMinutesList.push(minutes);
    }
  }

  // 4. Wrong notice rate
  const [notifiedCount, noticeWrongCount] = await Promise.all([
    prisma.waitRequest.count({
      where: { notifiedAt: { not: null } },
    }),
    prisma.waitRequest.count({
      where: { noticeWrong: true },
    }),
  ]);

  // 5. CSAT ratings
  const csatRecords = await prisma.waitRequest.findMany({
    where: { csat: { not: null } },
    select: { csat: true },
  });
  const csatRatings = csatRecords.map((r) => r.csat!).filter((n) => typeof n === "number");

  // 6. Waiting by Trip/Route/Date
  const pendingRequests = await prisma.waitRequest.findMany({
    where: { status: "Đang chờ" },
    include: { trip: true },
  });

  const tripGroupMap = new Map<
    string,
    { route: string; date: string; tripCode: string; waitingRequestsCount: number; waitingTicketsCount: number }
  >();

  for (const req of pendingRequests) {
    const key = req.tripId;
    const existing = tripGroupMap.get(key);
    if (existing) {
      existing.waitingRequestsCount += 1;
      existing.waitingTicketsCount += req.tickets;
    } else {
      tripGroupMap.set(key, {
        route: `${req.trip.origin} → ${req.trip.destination}`,
        date: req.trip.departureDate,
        tripCode: req.trip.code,
        waitingRequestsCount: 1,
        waitingTicketsCount: req.tickets,
      });
    }
  }

  const rawData: KpiRawData = {
    formStartedCount,
    requestCreatedCount,
    matchedRequestsCount,
    convertedRequestsCount,
    notifiedCount,
    noticeWrongCount,
    readDurationMinutesList,
    csatRatings,
    waitingByTripRouteDate: Array.from(tripGroupMap.values()),
  };

  const kpiMetrics = buildKpiMetricsList(rawData);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Bảng chỉ số đo lường hiệu quả (KPIs)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hệ thống 6 chỉ số đánh giá giải pháp Chờ vé thông minh theo mục tiêu chuyển đổi số
          </p>
        </div>

        {/* Note on page: "Số liệu từ dữ liệu giả lập, không phản ánh hệ thống thật." */}
        <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Số liệu từ dữ liệu giả lập, không phản ánh hệ thống thật.</span>
        </div>
      </div>

      {/* KPI Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4 w-48">Chỉ số KPI</th>
                <th className="py-3.5 px-4 w-64">Định nghĩa</th>
                <th className="py-3.5 px-4 w-52">Công thức</th>
                <th className="py-3.5 px-4 w-52">Cách đo</th>
                <th className="py-3.5 px-4 w-44 font-black text-indigo-900">Giá trị hiện tại</th>
                <th className="py-3.5 px-4 w-40 text-slate-500">Ngưỡng quyết định</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kpiMetrics.map((kpi, index) => (
                <tr key={kpi.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {kpi.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                    {kpi.definition}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-700 bg-indigo-50/40 p-2 rounded">
                    {kpi.formula}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 leading-relaxed">
                    {kpi.measurementMethod}
                  </td>
                  <td className="py-3.5 px-4 font-black text-sm text-blue-700">
                    {kpi.currentValue}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 italic">
                    {kpi.decisionThreshold}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
