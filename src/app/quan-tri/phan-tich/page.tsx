import React from "react";
import { BarChart3, TrendingUp, Layers, Train, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { REQUEST_STATUS } from "@/lib/constants";
import { formatDateVN } from "@/lib/utils";
import { DemandCharts } from "@/components/analytics/DemandCharts";

export const dynamic = "force-dynamic";

export default async function QuanTriPhanTichPage() {
  await requireStaff();

  // HARD CONSTRAINT: Count only status "Đang chờ"
  const pendingRequests = await prisma.waitRequest.findMany({
    where: { status: REQUEST_STATUS.PENDING },
    include: { trip: true },
  });

  // 1. Group by Trip
  const tripMap = new Map<
    string,
    { tripLabel: string; tickets: number; requestsCount: number }
  >();

  for (const r of pendingRequests) {
    const key = `${r.trip.code} (${formatDateVN(r.trip.departureDate)})`;
    const existing = tripMap.get(key);
    if (existing) {
      existing.tickets += r.tickets;
      existing.requestsCount += 1;
    } else {
      tripMap.set(key, {
        tripLabel: key,
        tickets: r.tickets,
        requestsCount: 1,
      });
    }
  }

  // Find highest bar
  let maxTripTickets = 0;
  for (const item of tripMap.values()) {
    if (item.tickets > maxTripTickets) {
      maxTripTickets = item.tickets;
    }
  }

  const tripChartData = Array.from(tripMap.values()).map((item) => ({
    ...item,
    isHighest: item.tickets > 0 && item.tickets === maxTripTickets,
  }));

  // 2. Group by Date
  const dateMap = new Map<
    string,
    { date: string; tickets: number; requestsCount: number }
  >();

  for (const r of pendingRequests) {
    const dateFormatted = formatDateVN(r.trip.departureDate);
    const existing = dateMap.get(dateFormatted);
    if (existing) {
      existing.tickets += r.tickets;
      existing.requestsCount += 1;
    } else {
      dateMap.set(dateFormatted, {
        date: dateFormatted,
        tickets: r.tickets,
        requestsCount: 1,
      });
    }
  }

  const dateChartData = Array.from(dateMap.values());

  // 3. Table by Route and Seat Class
  const routeClassMap = new Map<
    string,
    {
      route: string;
      seatClass: string;
      tripsList: Set<string>;
      tickets: number;
      requestsCount: number;
    }
  >();

  for (const r of pendingRequests) {
    const route = `${r.trip.origin} → ${r.trip.destination}`;
    const key = `${route}__${r.seatClass}`;
    const existing = routeClassMap.get(key);
    if (existing) {
      existing.tickets += r.tickets;
      existing.requestsCount += 1;
      existing.tripsList.add(r.trip.code);
    } else {
      routeClassMap.set(key, {
        route,
        seatClass: r.seatClass,
        tripsList: new Set([r.trip.code]),
        tickets: r.tickets,
        requestsCount: 1,
      });
    }
  }

  const routeClassTable = Array.from(routeClassMap.values()).sort(
    (a, b) => b.tickets - a.tickets
  );

  const totalWaitingTickets = pendingRequests.reduce((sum, r) => sum + r.tickets, 0);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Phân tích nhu cầu chưa được đáp ứng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tổng hợp từ các hành khách đang chờ vé (Trạng thái: <strong>Đang chờ</strong>)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
            Tổng vé đang chờ: <strong>{totalWaitingTickets} vé</strong>
          </div>
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-semibold">
            Tổng lượt yêu cầu: <strong>{pendingRequests.length} lượt</strong>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <DemandCharts tripData={tripChartData} dateData={dateChartData} />

      {/* Table by Route and Seat Class */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Bảng phân bổ nhu cầu theo tuyến đường và hạng chỗ
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Tuyến đường (Ga đi → Ga đến)</th>
                <th className="py-3 px-4">Hạng chỗ</th>
                <th className="py-3 px-4">Chuyến tàu liên quan</th>
                <th className="py-3 px-4 text-center">Số lượt yêu cầu</th>
                <th className="py-3 px-4 text-right">Tổng số vé đang chờ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routeClassTable.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Không có nhu cầu chờ nào đang tồn tại.
                  </td>
                </tr>
              ) : (
                routeClassTable.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.route}</td>
                    <td className="py-3 px-4 text-slate-700">{item.seatClass}</td>
                    <td className="py-3 px-4 text-indigo-700 font-semibold">
                      {Array.from(item.tripsList).map((c) => `Tàu ${c}`).join(", ")}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-800">
                      {item.requestsCount} lượt
                    </td>
                    <td className="py-3 px-4 text-right font-black text-blue-700 text-sm">
                      {item.tickets} vé
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
