import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ClipboardList,
  Search,
  Filter,
  PlusCircle,
  Train,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { REQUEST_STATUS, type RequestStatus } from "@/lib/constants";
import { expireDepartedRequests } from "@/lib/expire";
import { formatDateVN, formatDateTimeVN, getStatusBadgeClasses } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    status?: string;
    q?: string;
  };
}

export default async function YeuCauListPage({ searchParams }: Props) {
  const user = await getSession();
  if (!user) {
    redirect("/dang-nhap?redirectTo=/yeu-cau");
  }

  await expireDepartedRequests(user.id);

  const statusFilter = searchParams.status || "ALL";
  const searchQuery = (searchParams.q || "").trim();

  const activeCount = await prisma.waitRequest.count({
    where: {
      userId: user.id,
      OR: [
        { status: REQUEST_STATUS.PENDING },
        { status: REQUEST_STATUS.MATCHED, convertedAt: null },
      ],
    },
  });

  const reachedLimit = activeCount >= 5;
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const whereClause: any = {
    userId: user.id,
  };

  if (statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }

  if (searchQuery) {
    whereClause.code = { contains: searchQuery };
  }

  const requests = await prisma.waitRequest.findMany({
    where: whereClause,
    include: {
      trip: true,
      suggestedTrip: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Yêu cầu của tôi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi tình trạng các yêu cầu chờ vé tàu của bạn
          </p>
        </div>

       <div className="flex flex-col items-end gap-2">
         <span className="text-xs text-slate-500">
           Yêu cầu đang hoạt động: <strong>{activeCount}/5</strong>
         </span>

         {reachedLimit ? (
           <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold cursor-not-allowed">
             <PlusCircle className="w-4 h-4" />
             Đã đạt giới hạn 5 yêu cầu
           </span>
         ) : (
           <Link
             href="/cho-ve/moi"
             className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
           >
             <PlusCircle className="w-4 h-4" />
             Đăng ký chờ vé mới
           </Link>
         )}
       </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: REQUEST_STATUS.PENDING, label: "Đang chờ" },
            { id: REQUEST_STATUS.MATCHED, label: "Có vé phù hợp" },
            { id: REQUEST_STATUS.CANCELLED, label: "Đã hủy" },
          ].map((tab) => (
            <Link
              key={tab.id}
              href={`/yeu-cau?status=${encodeURIComponent(tab.id)}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
              }`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Search by Code */}
        <form method="GET" action="/yeu-cau" className="w-full sm:w-64 relative">
          {statusFilter !== "ALL" && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Tìm theo mã YC..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </form>
      </div>

      {/* Request List */}
      {requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Không tìm thấy yêu cầu chờ nào
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? "Không có yêu cầu phù hợp với bộ lọc hiện tại."
              : "Bạn hiện chưa gửi yêu cầu chờ vé nào."}
          </p>
          <div className="mt-4">
            <Link
              href="/cho-ve/moi"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-block shadow-sm"
            >
              Đăng ký chờ vé ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {requests.map((req) => {
            const badgeClasses = getStatusBadgeClasses(req.status);

            return (
              <div
                key={req.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-blue-700 text-sm tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      {req.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClasses}`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Gửi lúc: {formatDateTimeVN(req.createdAt)}
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Tàu {req.trip.code}:</span>
                      <span>{req.trip.origin}</span>
                      <span className="text-slate-400 font-normal">→</span>
                      <span>{req.trip.destination}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span>
                        Ngày đi: <strong>{formatDateVN(req.trip.departureDate)}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Hạng chỗ: <strong>{req.seatClass}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Số lượng: <strong>{req.tickets} vé</strong>
                      </span>
                    </div>

                    {/* Flexible options tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {req.acceptDateShift && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Lệch ±1 ngày
                        </span>
                      )}
                      {req.acceptOtherTrip && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Chuyến khác cùng tuyến
                        </span>
                      )}
                      {req.acceptOtherClass && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Loại chỗ khác
                        </span>
                      )}
                    </div>
                  </div>
                   {req.status === REQUEST_STATUS.MATCHED && req.suggestedTrip && (
                     <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                       <strong>Chuyến tàu được gợi ý:</strong>{" "}
                       Tàu {req.suggestedTrip.code} •{" "}
                       {formatDateVN(req.suggestedTrip.departureDate)}
                       <div className="mt-1">
                         Vui lòng xem chi tiết yêu cầu để thực hiện bước xác nhận đặt vé.
                       </div>
                     </div>
                   )}

                  <Link
                    href={`/yeu-cau/${req.code}`}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition self-end sm:self-center"
                  >
                    Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
