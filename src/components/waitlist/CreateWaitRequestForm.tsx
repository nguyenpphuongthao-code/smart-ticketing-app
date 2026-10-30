"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Train,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  Minus,
  Bell,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { SEAT_CLASSES } from "@/lib/constants";
import { formatDateVN } from "@/lib/utils";
import { createWaitRequestAction, logFormStartedAction } from "@/app/actions/waitlist";

interface TripItem {
  id: string;
  code: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  inventories: {
    seatClass: string;
    capacity: number;
    sold: number;
  }[];
}

interface Props {
  user: SessionUser;
  trips: TripItem[];
  initialTripId?: string;
  initialSeatClass?: string;
}

export function CreateWaitRequestForm({
  user,
  trips,
  initialTripId,
  initialSeatClass,
}: Props) {
  const router = useRouter();

  // Log form_started event once on mount
  useEffect(() => {
    logFormStartedAction();
  }, []);

  const [selectedTripId, setSelectedTripId] = useState<string>(
    initialTripId || (trips.length > 0 ? trips[0].id : "")
  );
  const [selectedSeatClass, setSelectedSeatClass] = useState<string>(
    initialSeatClass || SEAT_CLASSES[0]
  );
  const [tickets, setTickets] = useState<number>(1);
  const [acceptDateShift, setAcceptDateShift] = useState(false);
  const [acceptOtherTrip, setAcceptOtherTrip] = useState(false);
  const [acceptOtherClass, setAcceptOtherClass] = useState(false);
  const [channel, setChannel] = useState<"WEBSITE" | "SMS" | "EMAIL">(
    user.defaultChannel || "WEBSITE"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // Find currently selected trip
  const currentTrip = trips.find((t) => t.id === selectedTripId);

  // Chỉ lấy những loại chỗ thực sự tồn tại trên chuyến tàu
  const availableClasses = currentTrip
    ? SEAT_CLASSES.filter((sc) =>
        currentTrip.inventories.some((inv) => inv.seatClass === sc)
      )
    : [];

  // Calculate available seats for chosen class
  const currentInventory = currentTrip?.inventories.find(
    (inv) => inv.seatClass === selectedSeatClass
  );

  const availableSeats = currentInventory
    ? currentInventory.capacity - currentInventory.sold
    : 0;

  const isTripAvailableForPurchase = availableSeats >= tickets;

  // Chỉ cho phép đăng ký khi loại chỗ tồn tại
  // và số chỗ còn lại không đủ đáp ứng nhu cầu
  const canRegister =
    !!currentInventory && !isTripAvailableForPurchase;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canRegister) return;

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("tripId", selectedTripId);
    formData.append("seatClass", selectedSeatClass);
    formData.append("tickets", tickets.toString());
    formData.append("acceptDateShift", acceptDateShift ? "true" : "false");
    formData.append("acceptOtherTrip", acceptOtherTrip ? "true" : "false");
    formData.append("acceptOtherClass", acceptOtherClass ? "true" : "false");
    formData.append("channel", channel);

    try {
      const res = await createWaitRequestAction(formData);
      if (res.success && res.code) {
        setCreatedCode(res.code);
      } else {
        setError(res.error || "Không thể tạo yêu cầu chờ.");
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  // Success view showing the new request code
  if (createdCode) {
    return (
      <div className="bg-white border border-emerald-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Đăng ký chờ vé thành công!
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Hệ thống đã tiếp nhận nguyện vọng của bạn với mã số định danh:
        </p>
        <div className="inline-block px-5 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-extrabold text-2xl tracking-wider my-2">
          {createdCode}
        </div>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Bạn có thể theo dõi tiến độ xử lý và tình trạng ghép chỗ trong trang quản lý yêu cầu cá
          nhân.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/yeu-cau/${createdCode}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
          >
            Xem chi tiết yêu cầu <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/yeu-cau"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Về danh sách yêu cầu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Chọn chuyến tàu */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Chọn chuyến tàu mong muốn
          </label>
          <select
            value={selectedTripId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedTripId(id);

              const t = trips.find((x) => x.id === id);

              const stillValid = t?.inventories.some(
                (i) => i.seatClass === selectedSeatClass
              );

              // Nếu loại chỗ đang chọn không tồn tại trên chuyến mới,
              // tự động chuyển sang loại chỗ đầu tiên của chuyến đó
              if (!stillValid && t?.inventories[0]) {
                setSelectedSeatClass(t.inventories[0].seatClass);
              }
            }}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                Tàu {trip.code}: {trip.origin} → {trip.destination} ({formatDateVN(trip.departureDate)} lúc {trip.departureTime})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Chọn loại chỗ & Số vé */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Loại chỗ
            </label>
            <select
              value={selectedSeatClass}
              onChange={(e) => setSelectedSeatClass(e.target.value)}
              disabled={availableClasses.length === 0}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100"
            >
              {availableClasses.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Số lượng vé (Tối đa 6 vé)
            </label>
            <div className="flex items-center border border-slate-300 rounded-xl px-2 py-1 bg-white">
              <button
                type="button"
                onClick={() => setTickets((t) => Math.max(1, t - 1))}
                disabled={tickets <= 1}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-bold text-base text-slate-800">
                {tickets} vé
              </span>
              <button
                type="button"
                onClick={() => setTickets((t) => Math.min(6, t + 1))}
                disabled={tickets >= 6}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Business Rule Warning Check */}

        {isTripAvailableForPurchase && currentInventory ? (
          // Trường hợp 1: Còn đủ vé để mua trực tiếp
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">
                Chuyến này còn vé, bạn có thể đặt vé trên kênh bán vé chính thức.
              </p>
              <p className="mt-1 text-emerald-700">
                Hiện còn <strong>{availableSeats} chỗ trống</strong> cho loại chỗ này
                (nhu cầu của bạn: {tickets} vé). Bạn không cần đăng ký chờ.
              </p>
            </div>
          </div>
        ) : !currentInventory ? (
          // Trường hợp 2: Không có dữ liệu loại chỗ
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Chuyến này không có loại chỗ đã chọn. Vui lòng chọn chuyến tàu hoặc loại chỗ khác.
            </span>
          </div>
        ) : (
          // Trường hợp 3: Có loại chỗ nhưng không đủ vé
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Chuyến tàu không còn đủ {tickets} chỗ cho loại chỗ này.
              Bạn có thể đăng ký chờ vé.
            </span>
          </div>
        )}

        {/* 4. Tùy chọn linh hoạt */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            4. Tùy chọn linh hoạt (tăng cơ hội có vé)
          </label>
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={acceptDateShift}
                onChange={(e) => setAcceptDateShift(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Lệch ngày ±1 (chấp nhận đi trước hoặc sau 1 ngày)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={acceptOtherTrip}
                onChange={(e) => setAcceptOtherTrip(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Chuyến khác cùng tuyến (chấp nhận chuyến giờ khác trong cùng ngày)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={acceptOtherClass}
                onChange={(e) => setAcceptOtherClass(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Loại chỗ khác (sẵn sàng chuyển giữa Ghế ngồi mềm / Giường khoang 4 / 6)</span>
            </label>
          </div>
        </div>

        {/* 5. Kênh nhận thông báo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            5. Nhận thông báo qua (kênh giả lập)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "WEBSITE", label: "Website" },
              { id: "SMS", label: "SMS" },
              { id: "EMAIL", label: "Email" },
            ].map((item) => (
              <label
                key={item.id}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition ${
                  channel === item.id
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="channel"
                  value={item.id}
                  checked={channel === item.id}
                  onChange={() => setChannel(item.id as any)}
                  className="sr-only"
                />
                <Bell className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mandatory Note */}
        <div className="text-center">
          <p className="text-xs text-slate-500 italic">
            * Đăng ký chờ không đảm bảo có vé.
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading || !canRegister}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Đang gửi đăng ký..." : "Xác nhận gửi yêu cầu chờ vé"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
