"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Train,
  Ticket,
  Edit2,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  MapPin,
  Layers,
  X,
} from "lucide-react";
import { SEAT_CLASSES, REQUEST_STATUS } from "@/lib/constants";
import { formatDateVN } from "@/lib/utils";
import {
  updateSeatInventoryAction,
  recordTicketReturnAction,
  confirmMatchingSuggestionAction,
} from "@/app/actions/trips";
import { matchWaitingRequests, type CandidateTrip, type CandidateRequest, type MatchSuggestion } from "@/lib/matching";

interface TripData {
  id: string;
  code: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  inventories: {
    id: string;
    tripId: string;
    seatClass: string;
    capacity: number;
    sold: number;
  }[];
}

interface Props {
  trips: TripData[];
  pendingRequests: any[];
}

export function TripInventoryManagerView({ trips, pendingRequests }: Props) {
  const router = useRouter();

  // Return ticket form state
  const [returnTripId, setReturnTripId] = useState(trips.length > 0 ? trips[0].id : "");
  const [returnSeatClass, setReturnSeatClass] = useState<string>(SEAT_CLASSES[0]);
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<MatchSuggestion[] | null>(null);
  const [confirmingCode, setConfirmingCode] = useState<string | null>(null);
  const [confirmSuccessMsg, setConfirmSuccessMsg] = useState<string | null>(null);

  // Edit inventory modal state
  const [editingInv, setEditingInv] = useState<{
    id: string;
    tripCode: string;
    seatClass: string;
    capacity: number;
    sold: number;
  } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Filter states for trips list
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTripCode, setFilterTripCode] = useState("");
  const [filterOrigin, setFilterOrigin] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterSeatStatus, setFilterSeatStatus] = useState<"ALL" | "AVAILABLE" | "SOLD_OUT">("ALL");

  // Options extracted from trips
  const uniqueTripCodes = Array.from(new Set(trips.map((t) => t.code))).sort();
  const uniqueDates = Array.from(new Set(trips.map((t) => t.departureDate))).sort();
  const uniqueOrigins = Array.from(new Set(trips.map((t) => t.origin))).sort();
  const uniqueDestinations = Array.from(new Set(trips.map((t) => t.destination))).sort();

  const isFiltering =
    Boolean(searchKeyword.trim()) ||
    Boolean(filterDate) ||
    Boolean(filterTripCode) ||
    Boolean(filterOrigin) ||
    Boolean(filterDestination) ||
    filterSeatStatus !== "ALL";

  const clearFilters = () => {
    setSearchKeyword("");
    setFilterDate("");
    setFilterTripCode("");
    setFilterOrigin("");
    setFilterDestination("");
    setFilterSeatStatus("ALL");
  };

  const filteredTrips = trips.filter((trip) => {
    if (searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase();
      const match =
        trip.code.toLowerCase().includes(q) ||
        trip.origin.toLowerCase().includes(q) ||
        trip.destination.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterDate && trip.departureDate !== filterDate) {
      return false;
    }
    if (filterTripCode && trip.code !== filterTripCode) {
      return false;
    }
    if (filterOrigin && trip.origin !== filterOrigin) {
      return false;
    }
    if (filterDestination && trip.destination !== filterDestination) {
      return false;
    }
    if (filterSeatStatus === "SOLD_OUT") {
      const hasAvailable = trip.inventories.some((inv) => inv.capacity - inv.sold > 0);
      if (hasAvailable) return false;
    } else if (filterSeatStatus === "AVAILABLE") {
      const hasAvailable = trip.inventories.some((inv) => inv.capacity - inv.sold > 0);
      if (!hasAvailable) return false;
    }
    return true;
  });

  // Handle Return Ticket
  async function handleRecordReturn(e: React.FormEvent) {
    e.preventDefault();
    setReturnLoading(true);
    setReturnSuccessMsg(null);
    setConfirmSuccessMsg(null);

    const formData = new FormData();
    formData.append("tripId", returnTripId);
    formData.append("seatClass", returnSeatClass);
    formData.append("quantity", returnQuantity.toString());

    try {
      const res = await recordTicketReturnAction(formData);
      if (res.success) {
        setReturnSuccessMsg(res.message || "Ghi nhận vé trả thành công.");

        // Compute suggestions
        const currentTrip = trips.find((t) => t.id === returnTripId);
        if (currentTrip) {
          const candidateTrip: CandidateTrip = {
            id: currentTrip.id,
            code: currentTrip.code,
            origin: currentTrip.origin,
            destination: currentTrip.destination,
            departureDate: currentTrip.departureDate,
            departureTime: currentTrip.departureTime,
          };

          const matched = matchWaitingRequests(
            candidateTrip,
            returnSeatClass,
            returnQuantity,
            pendingRequests
          );
          setSuggestions(matched);
        }
        router.refresh();
      } else {
        alert(res.error || "Không thể ghi nhận vé trả.");
      }
    } finally {
      setReturnLoading(false);
    }
  }

  // Handle Confirm Matching Suggestion
  async function handleConfirmSuggestion(item: MatchSuggestion) {
    setConfirmingCode(item.request.code);
    try {
      const res = await confirmMatchingSuggestionAction(
        item.request.code,
        item.suggestedTripId,
        item.suggestedSeatClass
      );
      if (res.success) {
        setConfirmSuccessMsg(
          `Đã chuyển trạng thái yêu cầu ${item.request.code} sang 'Có vé phù hợp' và gửi thông báo cho hành khách.`
        );
        // Remove from current suggestions
        setSuggestions((prev) => prev?.filter((s) => s.request.code !== item.request.code) || []);
        router.refresh();
      } else {
        alert(res.error || "Lỗi khi xác nhận ghép chỗ.");
      }
    } finally {
      setConfirmingCode(null);
    }
  }

  // Handle Edit Inventory Submit
  async function handleEditInventory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingInv) return;
    setEditLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateSeatInventoryAction(editingInv.id, formData);
      if (res.success) {
        setEditingInv(null);
        router.refresh();
      } else {
        alert(res.error || "Lỗi cập nhật sức chứa.");
      }
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* SECTION: Ghi nhận vé trả (giả lập) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-indigo-700" />
          <h3 className="text-base font-bold text-indigo-950">
            Ghi nhận vé trả (giả lập) & Kích hoạt gợi ý ghép chỗ
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Khi có hành khách trả vé hoặc điều chuyển toa, số vé đã bán sẽ giảm. Hệ thống sẽ ngay lập
          tức đối soát danh sách người đang chờ theo thứ tự ưu tiên nghiệp vụ.
        </p>

        {returnSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold">
            {returnSuccessMsg}
          </div>
        )}

        <form onSubmit={handleRecordReturn} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyến tàu</label>
            <select
              value={returnTripId}
              onChange={(e) => setReturnTripId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  Tàu {t.code}: {t.origin} → {t.destination} ({formatDateVN(t.departureDate)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Loại chỗ trả lại</label>
            <select
              value={returnSeatClass}
              onChange={(e) => setReturnSeatClass(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {SEAT_CLASSES.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng vé trả</label>
            <input
              type="number"
              min={1}
              max={10}
              value={returnQuantity}
              onChange={(e) => setReturnQuantity(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={returnLoading}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {returnLoading ? "Đang xử lý..." : "Ghi nhận vé trả"}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION: Gợi ý ghép chỗ (Sau khi trả vé) */}
      {suggestions !== null && (
        <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Gợi ý ghép chỗ ({suggestions.length} yêu cầu phù hợp)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSuggestions(null)}
              className="text-xs text-slate-400 hover:text-slate-600 self-start sm:self-center"
            >
              Đóng bảng gợi ý
            </button>
          </div>

          {/* HARD CONSTRAINT WARNING */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>Gợi ý có thể trùng chỗ giữa nhiều yêu cầu; hệ thống không giữ chỗ.</span>
          </div>

          {confirmSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
              {confirmSuccessMsg}
            </div>
          )}

          {suggestions.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              Không có yêu cầu chờ nào phù hợp với số lượng vé và các điều kiện của chỗ vừa trả.
            </p>
          ) : (
            <div className="space-y-3">
              {suggestions.map((item) => (
                <div
                  key={item.request.code}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-indigo-700 text-xs bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                        {item.request.code}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {item.request.user?.name}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        {item.priorityLabel}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Nhu cầu: <strong>{item.request.tickets} vé</strong> • Ban đầu:{" "}
                      <strong>Tàu {item.request.trip.code}</strong> (
                      {formatDateVN(item.request.trip.departureDate)} - {item.request.seatClass})
                    </div>

                    <p className="text-xs text-indigo-900 italic font-medium">
                      Lý do gợi ý: {item.reason}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={confirmingCode === item.request.code}
                    onClick={() => handleConfirmSuggestion(item)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 self-end sm:self-center"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {confirmingCode === item.request.code ? "Đang lưu..." : "Xác nhận"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: Danh sách chuyến tàu & Kho chỗ */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Train className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Danh sách chuyến tàu & Kiểm soát tồn chỗ (Seat Inventory)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {filteredTrips.length}/{trips.length} chuyến
            </span>
            {isFiltering && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition"
              >
                <X className="w-3.5 h-3.5" />
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* BỘ LỌC TÌM KIẾM CHUYẾN TÀU */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bộ lọc tra cứu chuyến</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Từ khóa */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tìm theo mã tàu / ga
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Nhập SE1, Hà Nội, Đà Nẵng..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Ngày khởi hành */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Ngày khởi hành
              </label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả ngày</option>
                {uniqueDates.map((date) => (
                  <option key={date} value={date}>
                    {formatDateVN(date)}
                  </option>
                ))}
              </select>
            </div>

            {/* Chuyến tàu */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Train className="w-3 h-3 text-slate-400" />
                Chuyến tàu
              </label>
              <select
                value={filterTripCode}
                onChange={(e) => setFilterTripCode(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả chuyến</option>
                {uniqueTripCodes.map((code) => (
                  <option key={code} value={code}>
                    Tàu {code}
                  </option>
                ))}
              </select>
            </div>

            {/* Ga đi */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Ga đi
              </label>
              <select
                value={filterOrigin}
                onChange={(e) => setFilterOrigin(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả ga đi</option>
                {uniqueOrigins.map((origin) => (
                  <option key={origin} value={origin}>
                    {origin}
                  </option>
                ))}
              </select>
            </div>

            {/* Ga đến */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Ga đến
              </label>
              <select
                value={filterDestination}
                onChange={(e) => setFilterDestination(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Tất cả ga đến</option>
                {uniqueDestinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
            <span className="text-[11px] text-slate-500 font-medium">Tình trạng chỗ:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-200/70 text-xs">
              <button
                type="button"
                onClick={() => setFilterSeatStatus("ALL")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${filterSeatStatus === "ALL"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterSeatStatus("AVAILABLE")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${filterSeatStatus === "AVAILABLE"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Còn vé
              </button>
              <button
                type="button"
                onClick={() => setFilterSeatStatus("SOLD_OUT")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${filterSeatStatus === "SOLD_OUT"
                    ? "bg-white text-rose-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Đã hết vé
              </button>
            </div>
          </div>
        </div>

        {/* DANH SÁCH CÁC CHUYẾN TÀU */}
        <div className="space-y-6">
          {filteredTrips.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
              <Filter className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Không tìm thấy chuyến tàu nào phù hợp với bộ lọc hiện tại.
              </p>
              <p className="text-xs text-slate-500">
                Vui lòng thử thay đổi điều kiện lọc (ngày đi, mã tàu, ga đi/đến hoặc tình trạng vé).
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold"
              >
                Xóa toàn bộ bộ lọc
              </button>
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded text-xs">
                      Tàu {trip.code}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {trip.origin} → {trip.destination}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Khởi hành: <strong>{formatDateVN(trip.departureDate)}</strong> lúc{" "}
                    <strong>{trip.departureTime}</strong>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {trip.inventories.map((inv) => {
                    const available = inv.capacity - inv.sold;
                    const isSoldOut = available <= 0;

                    return (
                      <div
                        key={inv.id}
                        className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${isSoldOut ? "bg-rose-50/40 border-rose-200" : "bg-white border-slate-200"
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                            <span>{inv.seatClass}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingInv({
                                  id: inv.id,
                                  tripCode: trip.code,
                                  seatClass: inv.seatClass,
                                  capacity: inv.capacity,
                                  sold: inv.sold,
                                })
                              }
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                              title="Sửa sức chứa & vé bán"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Đã bán: <strong>{inv.sold}</strong> / Sức chứa: <strong>{inv.capacity}</strong>
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">Còn lại:</span>
                          {isSoldOut ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              Hết vé (0 chỗ)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              Còn {available} chỗ
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )))}
        </div>
      </div>

      {/* Edit Inventory Modal */}
      {editingInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Điều chỉnh tồn chỗ: Tàu {editingInv.tripCode} - {editingInv.seatClass}
            </h4>

            <form onSubmit={handleEditInventory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sức chứa (Capacity)
                </label>
                <input
                  type="number"
                  name="capacity"
                  defaultValue={editingInv.capacity}
                  min={0}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số vé đã bán (Sold)
                </label>
                <input
                  type="number"
                  name="sold"
                  defaultValue={editingInv.sold}
                  min={0}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={editLoading}
                  onClick={() => setEditingInv(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
