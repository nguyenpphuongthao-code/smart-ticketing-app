import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Calendar,
  Train,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { REQUEST_STATUS } from "@/lib/constants";
import { formatDateVN, formatDateTimeVN, getStatusBadgeClasses } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    q?: string;
    status?: string;
    tripCode?: string;
    date?: string;
    sort?: string;
    page?: string;
  };
}

export default async function QuanTriDanhSachYeuCauPage({ searchParams }: Props) {
  const searchQuery = (searchParams.q || "").trim();
  const statusFilter = searchParams.status || "ALL";
  const tripCodeFilter = searchParams.tripCode || "ALL";
  const dateFilter = searchParams.date || "";
  const sort = searchParams.sort || "created_desc";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 10;

  // Build filter query
  const where: any = {};
  if (searchQuery) {
    where.code = { contains: searchQuery };
  }
  if (statusFilter !== "ALL") {
    where.status = statusFilter;
  }
  if (tripCodeFilter !== "ALL") {
    where.trip = { ...where.trip, code: tripCodeFilter };
  }
  if (dateFilter) {
    where.trip = { ...where.trip, departureDate: dateFilter };
  }

  // Sorting
  let orderBy: any = { createdAt: "desc" };
  if (sort === "created_asc") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "tickets_desc") {
    orderBy = { tickets: "desc" };
  } else if (sort === "tickets_asc") {
    orderBy = { tickets: "asc" };
  }

  const [totalCount, requests, allTripCodes] = await Promise.all([
    prisma.waitRequest.count({ where }),
    prisma.waitRequest.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        trip: true,
        suggestedTrip: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.trip.findMany({
      select: { code: true },
      distinct: ["code"],
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Helper to construct query string
  const createQueryUrl = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (tripCodeFilter !== "ALL") params.set("tripCode", tripCodeFilter);
    if (dateFilter) params.set("date", dateFilter);
    if (sort !== "created_desc") params.set("sort", sort);
    params.set("page", page.toString());

    for (const [key, val] of Object.entries(newParams)) {
      if (val === "" || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val.toString());
      }
    }
    return `/quan-tri/yeu-cau?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            Danh sách yêu cầu chờ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng <strong>{totalCount}</strong> yêu cầu thỏa mãn điều kiện lọc
          </p>
        </div>

        <a
          href="/api/quan-tri/export-csv"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5" />
          Xuất CSV
        </a>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <form method="GET" action="/quan-tri/yeu-cau" className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* Search code */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mã yêu cầu</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="YC-001..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái</label>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value={REQUEST_STATUS.PENDING}>Đang chờ</option>
              <option value={REQUEST_STATUS.MATCHED}>Có vé phù hợp</option>
              <option value={REQUEST_STATUS.CANCELLED}>Đã hủy</option>
            </select>
          </div>

          {/* Trip code filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyến tàu</label>
            <select
              name="tripCode"
              defaultValue={tripCodeFilter}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">Tất cả chuyến</option>
              {allTripCodes.map((t) => (
                <option key={t.code} value={t.code}>
                  Tàu {t.code}
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày khởi hành</label>
            <input
              type="date"
              name="date"
              defaultValue={dateFilter}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Sort & Submit */}
          <div className="flex items-end gap-2">
            <select
              name="sort"
              defaultValue={sort}
              className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="created_desc">Mới nhất trước</option>
              <option value="created_asc">Cũ nhất trước</option>
              <option value="tickets_desc">Số vé nhiều nhất</option>
              <option value="tickets_asc">Số vé ít nhất</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Lọc
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Mã yêu cầu</th>
                <th className="py-3 px-4">Chuyến</th>
                <th className="py-3 px-4">Ngày đi</th>
                <th className="py-3 px-4">Số vé</th>
                <th className="py-3 px-4">Chấp nhận thay thế</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Tạo lúc</th>
                <th className="py-3 px-4">Thông báo lúc</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy yêu cầu nào phù hợp.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-extrabold text-indigo-700">{r.code}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">Tàu {r.trip.code}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {r.trip.origin} → {r.trip.destination}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {formatDateVN(r.trip.departureDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{r.tickets} vé</span>
                      <span className="text-[10px] text-slate-500 block">{r.seatClass}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {r.acceptDateShift && (
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">
                            Lệch ±1
                          </span>
                        )}
                        {r.acceptOtherTrip && (
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">
                            Chuyến khác
                          </span>
                        )}
                        {r.acceptOtherClass && (
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">
                            Hạng khác
                          </span>
                        )}
                        {!r.acceptDateShift && !r.acceptOtherTrip && !r.acceptOtherClass && (
                          <span className="text-slate-400 text-[10px]">Không thay thế</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClasses(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDateTimeVN(r.createdAt)}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {r.notifiedAt ? formatDateTimeVN(r.notifiedAt) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/quan-tri/yeu-cau/${r.code}`}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Trang <strong>{page}</strong> / <strong>{totalPages}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={createQueryUrl({ page: Math.max(1, page - 1) })}
                className={`p-1.5 rounded-lg border border-slate-300 ${
                  page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-slate-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={createQueryUrl({ page: Math.min(totalPages, page + 1) })}
                className={`p-1.5 rounded-lg border border-slate-300 ${
                  page >= totalPages ? "opacity-40 pointer-events-none" : "hover:bg-slate-100"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
