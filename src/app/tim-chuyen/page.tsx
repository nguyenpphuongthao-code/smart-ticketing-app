import React from "react";
import Link from "next/link";
import { Train, Calendar, MapPin, Search, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { STATIONS } from "@/lib/stations";
import { formatDateVN } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface TimChuyenProps {
  searchParams: {
    origin?: string;
    destination?: string;
    date?: string;
  };
}

export default async function TimChuyenPage({ searchParams }: TimChuyenProps) {
  const origin = searchParams.origin || "";
  const destination = searchParams.destination || "";
  const date = searchParams.date || "";

  // Build filter query
  const today = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Ho_Chi_Minh",
  });

  const whereClause: any = {};
  if (origin) {
      whereClause.origin = { contains: origin };
  }
  if (destination) {
      whereClause.destination = { contains: destination };
  }

  // Chỉ lấy chuyến chưa khởi hành
  whereClause.departureDate = date
      ? { equals: date, gte: today }
      : { gte: today };

  const trips = await prisma.trip.findMany({
    where: whereClause,
    include: {
      inventories: true,
    },
    orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header & Filter Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Train className="w-5 h-5 text-blue-600" />
          Tìm kiếm chuyến tàu & Kiểm tra tồn chỗ
        </h1>

        <form method="GET" action="/tim-chuyen" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ga đi</label>
            <select
              name="origin"
              defaultValue={origin}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả ga đi</option>
              {STATIONS.map((st) => (
                <option key={`orig-${st.name}`} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ga đến</label>
            <select
              name="destination"
              defaultValue={destination}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả ga đến</option>
              {STATIONS.map((st) => (
                <option key={`dest-${st.name}`} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày khởi hành</label>
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Search className="w-4 h-4" />
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800">
          Kết quả tìm kiếm ({trips.length} chuyến tàu)
        </h2>
        {(origin || destination || date) && (
          <Link
            href="/tim-chuyen"
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Xóa bộ lọc
          </Link>
        )}
      </div>

      {/* Results List */}
      {trips.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Không tìm thấy chuyến tàu nào phù hợp
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Vui lòng thử tìm kiếm với các ga hoặc ngày đi khác, hoặc xem toàn bộ danh sách chuyến tàu
            mẫu có sẵn.
          </p>
          <div className="mt-4">
            <Link
              href="/tim-chuyen"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium inline-block"
            >
              Xem tất cả chuyến tàu
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => {

            return (
              <div
                key={trip.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm">
                      Tàu {trip.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                        <span>{trip.origin}</span>
                        <span className="text-slate-400">→</span>
                        <span>{trip.destination}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateVN(trip.departureDate)}
                        </span>
                        <span>•</span>
                        <span>Giờ xuất phát: {trip.departureTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/chuyen/${trip.id}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Seat Inventories Breakdown */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {trip.inventories.map((inv) => {
                    const available = inv.capacity - inv.sold;
                    const isSoldOut = available <= 0;

                    return (
                      <div
                        key={inv.id}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                          isSoldOut
                            ? "bg-rose-50/50 border-rose-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{inv.seatClass}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {inv.sold}/{inv.capacity} vé đã bán
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          {isSoldOut ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                                Hết vé
                              </span>
                                <Link
                                  href={`/cho-ve/moi?tripId=${trip.id}&seatClass=${encodeURIComponent(inv.seatClass)}`}
                                  className="text-[11px] font-semibold text-amber-700 hover:underline"
                                >
                                  Đăng ký chờ →
                                </Link>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              Còn vé ({available})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
