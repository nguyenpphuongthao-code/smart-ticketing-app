import React from "react";
import Link from "next/link";
import {
  Clock,
  Ticket,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Train,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { REQUEST_STATUS } from "@/lib/constants";
import { formatDateVN, formatDateTimeVN, getStatusBadgeClasses } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QuanTriTongQuanPage() {
  // Query 4 cards
  const pendingRequests = await prisma.waitRequest.findMany({
    where: { status: REQUEST_STATUS.PENDING },
    include: { trip: true },
  });

  const matchedCount = await prisma.waitRequest.count({
    where: { status: REQUEST_STATUS.MATCHED },
  });

  const cancelledCount = await prisma.waitRequest.count({
    where: { status: REQUEST_STATUS.CANCELLED },
  });

  const pendingRequestsCount = pendingRequests.length;
  const pendingTicketsCount = pendingRequests.reduce((sum, r) => sum + r.tickets, 0);

  // Calculate highest waiting demand trip for "Gợi ý để nhân sự xem xét"
  const tripDemandMap = new Map<
    string,
    { trip: (typeof pendingRequests)[0]["trip"]; tickets: number; requestsCount: number }
  >();

  for (const req of pendingRequests) {
    const existing = tripDemandMap.get(req.tripId);
    if (existing) {
      existing.tickets += req.tickets;
      existing.requestsCount += 1;
    } else {
      tripDemandMap.set(req.tripId, {
        trip: req.trip,
        tickets: req.tickets,
        requestsCount: 1,
      });
    }
  }

  let topTripRecommendation = "Hiện tại chưa có đủ dữ liệu nhu cầu chờ để đưa ra gợi ý.";
  if (tripDemandMap.size > 0) {
    let maxItem: { trip: (typeof pendingRequests)[0]["trip"]; tickets: number } | null = null;
    for (const item of Array.from(tripDemandMap.values())) {
      if (!maxItem || item.tickets > maxItem.tickets) {
        maxItem = item;
      }
    }
    if (maxItem) {
      topTripRecommendation = `Chuyến ${maxItem.trip.code} (${maxItem.trip.origin} – ${
        maxItem.trip.destination
      }) ngày ${formatDateVN(
        maxItem.trip.departureDate
      )} có nhu cầu chờ cao nhất (${maxItem.tickets} vé). Số người chờ không đồng nghĩa với số vé chắc chắn bán được; cần xem xét điều kiện kỹ thuật, lịch chạy tàu và chi phí trước khi quyết định.`;
    }
  }

  // Recent 5 requests
  const recentRequests = await prisma.waitRequest.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      trip: true,
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* 4 Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Yêu cầu đang chờ */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Yêu cầu đang chờ
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingRequestsCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Lượt yêu cầu hành khách đang đợi xử lý
          </div>
        </div>

        {/* Card 2: Vé đang chờ */}
        <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Vé đang chờ
            </span>
            <Ticket className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingTicketsCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tổng số vé chưa được đáp ứng
          </div>
        </div>

        {/* Card 3: Có vé phù hợp */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Có vé phù hợp
            </span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{matchedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đã tìm được chỗ và gửi thông báo
          </div>
        </div>

        {/* Card 4: Đã hủy */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Đã hủy
            </span>
            <XCircle className="w-5 h-5 text-slate-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{cancelledCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Yêu cầu do khách hoặc nhân viên hủy
          </div>
        </div>
      </div>

      {/* BOX: Gợi ý để nhân sự xem xét (HARD CONSTRAINT: Strictly NO action buttons in this box!) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wider">
                Gợi ý để nhân sự xem xét
              </h2>
              <span className="text-[10px] bg-indigo-200/80 text-indigo-900 font-semibold px-2 py-0.5 rounded">
                Dữ liệu hỗ trợ ra quyết định (Không tự động)
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              {topTripRecommendation}
            </p>
            <p className="text-xs text-slate-500 italic pt-1">
              * Lưu ý nghiệp vụ: Hệ thống chỉ cung cấp số liệu thống kê để nhân sự chuyên môn thẩm định.
              Quyết định bổ sung toa xe hoặc lập tàu tăng cường phải tuân thủ quy chuẩn kỹ thuật an toàn
              chạy tàu và năng lực thông qua của tuyến.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Recent Requests Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Yêu cầu chờ mới ghi nhận gần đây
          </h3>
          <Link
            href="/quan-tri/yeu-cau"
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            Xem toàn bộ bảng yêu cầu <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Mã yêu cầu</th>
                <th className="py-2.5 px-3">Hành khách</th>
                <th className="py-2.5 px-3">Chuyến tàu</th>
                <th className="py-2.5 px-3">Ngày đi</th>
                <th className="py-2.5 px-3">Hạng & Số vé</th>
                <th className="py-2.5 px-3">Trạng thái</th>
                <th className="py-2.5 px-3">Thời gian gửi</th>
                <th className="py-2.5 px-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-bold text-indigo-700">{req.code}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    <div>{req.user.name}</div>
                    <div className="text-[10px] text-slate-400">{req.user.email}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900">Tàu {req.trip.code}</span>
                    <span className="text-slate-400 text-[11px] block">
                      {req.trip.origin} → {req.trip.destination}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{formatDateVN(req.trip.departureDate)}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-800">{req.tickets} vé</span>
                    <span className="text-slate-500 text-[11px] block">{req.seatClass}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClasses(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {formatDateTimeVN(req.createdAt)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      href={`/quan-tri/yeu-cau/${req.code}`}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded text-[11px] font-semibold transition"
                    >
                      Xử lý
                    </Link>
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
