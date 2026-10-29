"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Train,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Star,
  ArrowLeft,
  Bell,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { REQUEST_STATUS } from "@/lib/constants";
import { formatDateVN, formatDateTimeVN, getStatusBadgeClasses } from "@/lib/utils";
import {
  cancelWaitRequestAction,
  confirmConvertedAction,
  rateCsatAction,
} from "@/app/actions/waitlist";

interface Props {
  request: any;
  isStaff: boolean;
}

export function WaitRequestDetailView({ request, isStaff }: Props) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [converting, setConverting] = useState(false);
  const [selectedCsat, setSelectedCsat] = useState<number>(request.csat || 0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isMatched = request.status === REQUEST_STATUS.MATCHED;
  const isCancelled = request.status === REQUEST_STATUS.CANCELLED;
  const isPending = request.status === REQUEST_STATUS.PENDING;

  // Timeline step calculation
  // 1: Đã gửi yêu cầu (always true)
  // 2: Đang chờ vé phù hợp (true if pending or matched)
  // 3: Có vé phù hợp (true if matched)
  const currentStep = isCancelled ? 1 : isMatched ? 3 : 2;

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await cancelWaitRequestAction(request.code, cancelReason);
      if (res.success) {
        setShowCancelModal(false);
        router.refresh();
      } else {
        alert(res.error || "Không thể hủy yêu cầu.");
      }
    } finally {
      setCancelling(false);
    }
  }

  async function handleConfirmConverted() {
    setConverting(true);
    try {
      const res = await confirmConvertedAction(request.code);
      if (res.success) {
        setActionMessage("Đã ghi nhận bạn đã đặt vé thành công trên kênh chính thức (giả lập).");
        router.refresh();
      }
    } finally {
      setConverting(false);
    }
  }

  async function handleRateCsat(stars: number) {
    setSelectedCsat(stars);
    setRatingLoading(true);
    try {
      await rateCsatAction(request.code, stars);
      setActionMessage("Cảm ơn bạn đã gửi đánh giá mức độ hài lòng!");
      router.refresh();
    } finally {
      setRatingLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/yeu-cau"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Về danh sách yêu cầu của tôi
      </Link>

      {/* MATCHED BANNER */}
      {isMatched && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-emerald-950">
                Đã có vé phù hợp cho yêu cầu của bạn
              </h2>
              <p className="text-xs text-emerald-800">
                Chuyến gợi ý:{" "}
                <strong>
                  Tàu {request.suggestedTrip?.code || request.trip.code} (
                  {request.suggestedTrip?.origin || request.trip.origin} →{" "}
                  {request.suggestedTrip?.destination || request.trip.destination})
                </strong>{" "}
                ngày{" "}
                <strong>
                  {formatDateVN(
                    request.suggestedTrip?.departureDate || request.trip.departureDate
                  )}
                </strong>
                , loại chỗ:{" "}
                <strong>{request.suggestedSeatClass || request.seatClass}</strong>.
              </p>
              <p className="text-xs text-emerald-700 italic">
                Đã gửi thông báo qua <strong>{request.channel}</strong> (giả lập). Không giữ chỗ
                thật.
              </p>
              {request.staffNote && (
                <div className="mt-2 p-2.5 bg-white/80 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                  <strong>Ghi chú từ nhân viên:</strong> {request.staffNote}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-emerald-200">
            {request.convertedAt ? (
              <div className="text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  Bạn đã xác nhận đặt vé lúc {formatDateTimeVN(request.convertedAt)} (giả lập).
                </span>
              </div>
            ) : (
              <button
                type="button"
                disabled={converting}
                onClick={handleConfirmConverted}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                {converting
                  ? "Đang lưu..."
                  : "Tôi đã đặt vé trên kênh chính thức (giả lập)"}
              </button>
            )}

            {/* CSAT 1-5 Rating */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-950">
                Mức hài lòng:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={ratingLoading}
                    onClick={() => handleRateCsat(star)}
                    className="p-1 hover:scale-110 transition"
                    title={`${star} sao`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= selectedCsat
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {actionMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs">
          {actionMessage}
        </div>
      )}

      {/* Main Request Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-blue-700 text-lg bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
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
              Đăng ký lúc: {formatDateTimeVN(request.createdAt)} • Kênh nhận: {request.channel}
            </p>
          </div>

          {(isPending || isMatched) && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="px-3.5 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition self-start sm:self-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hủy yêu cầu
            </button>
          )}
        </div>

        {/* TIMELINE */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
            Tiến trình xử lý
          </h3>
          <div className="grid grid-cols-3 gap-2 relative">
            {/* Step 1 */}
            <div
              className={`p-3 rounded-xl border text-center ${
                currentStep >= 1
                  ? "bg-blue-50 border-blue-300 text-blue-900 font-semibold"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div className="text-xs">Bước 1</div>
              <div className="text-sm font-bold mt-0.5">Đã gửi yêu cầu</div>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3 rounded-xl border text-center ${
                currentStep >= 2
                  ? isMatched
                    ? "bg-blue-50 border-blue-300 text-blue-900 font-semibold"
                    : "bg-amber-50 border-amber-300 text-amber-900 font-semibold"
                  : isCancelled
                  ? "bg-slate-100 border-slate-200 text-slate-400"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div className="text-xs">Bước 2</div>
              <div className="text-sm font-bold mt-0.5">Đang chờ vé phù hợp</div>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3 rounded-xl border text-center ${
                currentStep === 3
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                  : isCancelled
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div className="text-xs">Bước 3</div>
              <div className="text-sm font-bold mt-0.5">
                {isCancelled ? "Đã hủy" : "Có vé phù hợp"}
              </div>
            </div>
          </div>
          {isCancelled && request.cancelReason && (
            <div className="mt-3 p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
              <strong>Lý do hủy:</strong> {request.cancelReason}
            </div>
          )}
        </div>

        {/* TRIP INFO */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Thông tin hành trình mong muốn
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500">Chuyến tàu:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                Tàu {request.trip.code}: {request.trip.origin} → {request.trip.destination}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Ngày & Giờ đi:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {formatDateVN(request.trip.departureDate)} lúc {request.trip.departureTime}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Hạng chỗ mong muốn:</span>
              <div className="font-bold text-slate-900 mt-0.5">{request.seatClass}</div>
            </div>
            <div>
              <span className="text-slate-500">Số lượng vé:</span>
              <div className="font-bold text-slate-900 mt-0.5">{request.tickets} vé</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-xs">
            <span className="text-slate-500">Tùy chọn linh hoạt đã chọn:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span
                className={`px-2 py-0.5 rounded text-[11px] ${
                  request.acceptDateShift
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-slate-200/60 text-slate-400 line-through"
                }`}
              >
                Lệch ngày ±1
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] ${
                  request.acceptOtherTrip
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-slate-200/60 text-slate-400 line-through"
                }`}
              >
                Chuyến khác cùng tuyến
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] ${
                  request.acceptOtherClass
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-slate-200/60 text-slate-400 line-through"
                }`}
              >
                Loại chỗ khác
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Xác nhận hủy yêu cầu chờ vé</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn hủy yêu cầu <strong>{request.code}</strong> không? Sau khi
              hủy, nhân viên điều hành sẽ không thể gửi gợi ý chỗ trống cho yêu cầu này nữa.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lý do hủy (không bắt buộc)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Đã đổi phương tiện, kế hoạch thay đổi..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
