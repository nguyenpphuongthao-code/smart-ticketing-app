import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Train,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldAlert,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDateVN } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ChuyenDetailProps {
  params: {
    id: string;
  };
}

export default async function ChuyenDetailPage({ params }: ChuyenDetailProps) {
  const user = await getSession();
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
    include: {
      inventories: true,
    },
  });

  if (!trip) {
    notFound();
  }

  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const isPast = trip.departureDate < today;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link
        href="/tim-chuyen"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Quay lại tìm chuyến
      </Link>

      {/* Trip Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm mb-2">
              <Train className="w-4 h-4" />
              Chuyến tàu {trip.code}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>{trip.origin}</span>
              <span className="text-slate-400 font-normal">→</span>
              <span>{trip.destination}</span>
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
            <div className="flex items-center sm:justify-end gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Ngày đi: <strong>{formatDateVN(trip.departureDate)}</strong></span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Giờ xuất phát: <strong>{trip.departureTime}</strong></span>
            </div>
          </div>
        </div>

       {isPast && (
         <div className="mt-4 p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600">
           <AlertTriangle className="w-4 h-4 text-slate-500 flex-shrink-0" />
           <span>
             Chuyến tàu này đã khởi hành, không thể đăng ký chờ hoặc đặt vé.
           </span>
         </div>
       )}
      </div>

      {/* Seat Inventories & Booking / Waitlist Options */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-800">
          Tình trạng tồn chỗ theo từng loại khoang
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {trip.inventories.map((inv) => {
            const available = inv.capacity - inv.sold;
            const isSoldOut = available <= 0;

            // Construct waitlist URL
            const waitlistUrl = `/cho-ve/moi?tripId=${trip.id}&seatClass=${encodeURIComponent(
              inv.seatClass
            )}`;
            const loginWaitlistUrl = `/dang-nhap?redirectTo=${encodeURIComponent(waitlistUrl)}`;

            return (
              <div
                key={inv.id}
                className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSoldOut ? "border-amber-200 bg-amber-50/20" : "border-slate-200"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">{inv.seatClass}</span>
                    {isSoldOut ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                        Hết vé
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">
                        Còn vé ({available} chỗ)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    Sức chứa: {inv.capacity} chỗ • Đã bán: {inv.sold} chỗ
                  </div>
                </div>

              <div>
                {isPast ? null : isSoldOut ? (
                  <div className="space-y-1.5 text-right">
                    {user ? (
                      <Link
                        href={waitlistUrl}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                      >
                        Đăng ký chờ vé cho loại chỗ này
                      </Link>
                    ) : (
                      <Link
                        href={loginWaitlistUrl}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                      >
                        Đăng nhập để đăng ký chờ
                      </Link>
                    )}
                    <p className="text-[11px] text-slate-400 text-center sm:text-right">
                      Chuyến đã hết chỗ, không thể mua trực tiếp
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 text-right">
                    <a
                      href="https://dsvn.vn/#/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                      title="Mở website chính thức của Đường sắt Việt Nam"
                    >
                      Đặt vé trên kênh chính thức
                    </a>
                    <p className="text-[11px] text-slate-400 text-center sm:text-right">
                      Chuyến còn vé, vui lòng mua trên hệ thống thật
                    </p>
                    {available < 6 && (
                      <Link
                        href={user ? waitlistUrl : loginWaitlistUrl}
                        className="block text-[11px] text-amber-700 hover:underline text-center sm:text-right"
                      >
                        Cần nhiều hơn {available} vé? Đăng ký chờ
                      </Link>
                    )}
                  </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
