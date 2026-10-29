"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Train,
  Calendar,
  Clock,
  User,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Send,
} from "lucide-react";
import { REQUEST_STATUS, SEAT_CLASSES } from "@/lib/constants";
import { formatDateVN, formatDateTimeVN, getStatusBadgeClasses } from "@/lib/utils";
import { staffUpdateWaitRequestStatusAction } from "@/app/actions/staff";

interface TripOption {
  id: string;
  code: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
}

interface Props {
  request: any;
  allTrips: TripOption[];
}

export function StaffRequestActionView({ request, allTrips }: Props) {
  const router = useRouter();

  const [targetStatus, setTargetStatus] = useState<string>(
    request.status === REQUEST_STATUS.PENDING ? REQUEST_STATUS.MATCHED : REQUEST_STATUS.CANCELLED
  );
  const [suggestedTripId, setSuggestedTripId] = useState<string>(
    request.suggestedTripId || request.tripId
  );
  const [suggestedSeatClass, setSuggestedSeatClass] = useState<string>(
    request.suggestedSeatClass || request.seatClass
  );
  const [staffNote, setStaffNote] = useState<string>(request.staffNote || "");
  const [noticeWrong, setNoticeWrong] = useState<boolean>(request.noticeWrong);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isCancelled = request.status === REQUEST_STATUS.CANCELLED;
  const isMatched = request.status === REQUEST_STATUS.MATCHED;

  async function handleStatusSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("code", request.code);
    formData.append("status", targetStatus);
    formData.append("suggestedTripId", suggestedTripId);
    formData.append("suggestedSeatClass", suggestedSeatClass);
    formData.append("staffNote", staffNote);
    formData.append("noticeWrong", noticeWrong ? "true" : "false");

    try {
      const res = await staffUpdateWaitRequestStatusAction(formData);
      if (res.success) {
        setSuccessMsg("Cập nhật trạng thái và gửi thông báo thành công!");
        router.refresh();
      } else {
        setError(res.error || "Không thể cập nhật trạng thái.");
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/quan-tri/yeu-cau"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Về danh sách yêu cầu
      </Link>

      {/* Main Request Information Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-black text-indigo-700 text-xl tracking-wider bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                {request.code}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClasses(
                  request.status
                )}`}
              >
                {request.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tạo lúc: {formatDateTimeVN(request.createdAt)} • Kênh thông báo đã chọn:{" "}
              <strong>{request.channel}</strong>
            </p>
          </div>

          {request.noticeWrong && (
            <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Đã đánh dấu: Thông báo sai / không còn chỗ</span>
            </div>
          )}
        </div>

        {/* Passenger & Journey Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Thông tin hành khách
            </span>
            <div>
              <span className="text-slate-500">Họ và tên:</span>{" "}
              <strong className="text-slate-900">{request.user.name}</strong>
            </div>
            <div>
              <span className="text-slate-500">Email:</span>{" "}
              <strong className="text-slate-900">{request.user.email}</strong>
            </div>
            <div>
              <span className="text-slate-500">Số điện thoại:</span>{" "}
              <strong className="text-slate-900">{request.user.phone || "Chưa cung cấp"}</strong>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Chuyến tàu đăng ký
            </span>
            <div>
              <span className="text-slate-500">Hành trình:</span>{" "}
              <strong className="text-slate-900">
                Tàu {request.trip.code}: {request.trip.origin} → {request.trip.destination}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Ngày & Giờ đi:</span>{" "}
              <strong className="text-slate-900">
                {formatDateVN(request.trip.departureDate)} lúc {request.trip.departureTime}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Hạng & Số lượng:</span>{" "}
              <strong className="text-slate-900">
                {request.seatClass} ({request.tickets} vé)
              </strong>
            </div>
          </div>
        </div>

        {/* Flexibility Options */}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs">
          <span className="font-semibold text-blue-900">Mức độ linh hoạt của khách:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                request.acceptDateShift
                  ? "bg-blue-100 text-blue-800 font-bold"
                  : "bg-slate-200/50 text-slate-400 line-through"
              }`}
            >
              Lệch ngày ±1
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                request.acceptOtherTrip
                  ? "bg-blue-100 text-blue-800 font-bold"
                  : "bg-slate-200/50 text-slate-400 line-through"
              }`}
            >
              Chuyến khác cùng tuyến
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                request.acceptOtherClass
                  ? "bg-blue-100 text-blue-800 font-bold"
                  : "bg-slate-200/50 text-slate-400 line-through"
              }`}
            >
              Loại chỗ khác
            </span>
          </div>
        </div>
      </div>

      {/* Staff Action Panel */}
      <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">
            Xử lý & Cập nhật trạng thái yêu cầu
          </h3>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
            {successMsg}
          </div>
        )}

        {isCancelled ? (
          <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-600">
            Yêu cầu này đã ở trạng thái <strong>Đã hủy</strong>. Không thể thay đổi trạng thái nữa.
          </div>
        ) : (
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            {/* Status selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Chuyển trạng thái sang:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {!isMatched && (
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition ${
                      targetStatus === REQUEST_STATUS.MATCHED
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={REQUEST_STATUS.MATCHED}
                      checked={targetStatus === REQUEST_STATUS.MATCHED}
                      onChange={() => setTargetStatus(REQUEST_STATUS.MATCHED)}
                    />
                    <span>Có vé phù hợp (Gửi thông báo)</span>
                  </label>
                )}

                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition ${
                    targetStatus === REQUEST_STATUS.CANCELLED
                      ? "bg-rose-50 border-rose-500 text-rose-900"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={REQUEST_STATUS.CANCELLED}
                    checked={targetStatus === REQUEST_STATUS.CANCELLED}
                    onChange={() => setTargetStatus(REQUEST_STATUS.CANCELLED)}
                  />
                  <span>Đã hủy</span>
                </label>
              </div>
            </div>

            {/* When choosing "Có vé phù hợp": Select suggested trip and class */}
            {targetStatus === REQUEST_STATUS.MATCHED && (
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-4">
                <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Thông tin chuyến & chỗ gợi ý cho hành khách
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chuyến tàu gợi ý
                    </label>
                    <select
                      value={suggestedTripId}
                      onChange={(e) => setSuggestedTripId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {allTrips.map((t) => (
                        <option key={t.id} value={t.id}>
                          Tàu {t.code}: {t.origin} → {t.destination} ({formatDateVN(t.departureDate)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hạng chỗ gợi ý
                    </label>
                    <select
                      value={suggestedSeatClass}
                      onChange={(e) => setSuggestedSeatClass(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {SEAT_CLASSES.map((sc) => (
                        <option key={sc} value={sc}>
                          {sc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Staff Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú của nhân viên điều hành (hiển thị kèm thông báo)
              </label>
              <textarea
                value={staffNote}
                onChange={(e) => setStaffNote(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Đã có chỗ trống phát sinh do trả vé, quý khách vui lòng đặt sớm..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notice Wrong Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={noticeWrong}
                  onChange={(e) => setNoticeWrong(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <span>
                  Đánh dấu thông báo sai / không còn chỗ (sử dụng để tính KPI tỷ lệ thông báo sai)
                </span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? "Đang lưu..." : "Xác nhận & Cập nhật"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
