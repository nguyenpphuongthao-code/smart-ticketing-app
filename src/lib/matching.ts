import { REQUEST_STATUS } from "./constants";

export interface CandidateTrip {
  id: string;
  code: string;
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string;
}

export interface CandidateRequest {
  id: string;
  code: string;
  userId: string;
  tripId: string;
  seatClass: string;
  tickets: number;
  acceptDateShift: boolean;
  acceptOtherTrip: boolean;
  acceptOtherClass: boolean;
  status: string;
  createdAt: Date | string;
  user?: {
    name: string;
    email: string;
    phone?: string | null;
  };
  trip: CandidateTrip;
}

export interface MatchSuggestion {
  request: CandidateRequest;
  tier: number;
  priorityLabel: string;
  reason: string;
  suggestedTripId: string;
  suggestedSeatClass: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Chênh lệch số ngày (có dấu) giữa hai ngày dạng YYYY-MM-DD. */
function daysDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round((d1.getTime() - d2.getTime()) / MS_PER_DAY);
}

/** So sánh tên ga không phân biệt hoa/thường và khoảng trắng thừa. */
function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/** YYYY-MM-DD -> DD/MM/YYYY để hiển thị trong lý do gợi ý. */
function formatDate(dateStr: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(dateStr)
    ? dateStr.slice(0, 10).split("-").reverse().join("/")
    : dateStr;
}

/**
 * Rule-based matching engine for returned/freed seats.
 * Evaluates pending wait requests against a trip and seat class that became available.
 *
 * Quy tắc (xét lần lượt, yêu cầu khớp mức cao nhất thì dừng):
 *  - Yêu cầu phải còn "Đang chờ" và số vé không vượt quá số chỗ trống.
 *  - Ưu tiên 1: đúng chuyến, đúng hạng chỗ.
 *  - Ưu tiên 2: cùng chuyến, khác hạng chỗ, khách chấp nhận đổi hạng chỗ.
 *  - Ưu tiên 3: chuyến khác cùng tuyến, cùng ngày, khách chấp nhận chuyến khác
 *               (và chấp nhận đổi hạng chỗ nếu hạng chỗ trống khác hạng đã đăng ký).
 *  - Ưu tiên 4: cùng tuyến, lệch đúng 1 ngày, khách chấp nhận lệch ngày
 *               (và chấp nhận đổi hạng chỗ nếu hạng chỗ trống khác hạng đã đăng ký).
 *  - Kết quả sắp xếp theo mức ưu tiên, cùng mức thì yêu cầu đăng ký sớm hơn đứng trước.
 *
 * Hàm chỉ GỢI Ý. Nhân viên là người kiểm tra và xác nhận ghép.
 */
export function matchWaitingRequests(
  availableTrip: CandidateTrip,
  availableSeatClass: string,
  availableQuantity: number,
  pendingRequests: CandidateRequest[]
): MatchSuggestion[] {
  const suggestions: MatchSuggestion[] = [];

  for (const req of pendingRequests) {
    if (req.status !== REQUEST_STATUS.PENDING) continue;
    // Request must fit the freed capacity
    if (req.tickets > availableQuantity) continue;

    const isSameTrip = req.tripId === availableTrip.id;
    const isSameClass = req.seatClass === availableSeatClass;
    // Hạng chỗ chấp nhận được: đúng hạng, hoặc khách cho phép đổi hạng
    const classOk = isSameClass || req.acceptOtherClass;
    const isSameRoute =
      normalizeName(req.trip.origin) === normalizeName(availableTrip.origin) &&
      normalizeName(req.trip.destination) === normalizeName(availableTrip.destination);
    const dayDifference = Math.abs(
      daysDiff(req.trip.departureDate, availableTrip.departureDate)
    );

    // Ghi chú thêm khi hạng chỗ trống khác hạng đã đăng ký
    const classNote = isSameClass
      ? ""
      : ` Đồng thời hành khách đồng ý đổi loại chỗ (mong muốn: ${req.seatClass}, chỗ trống: ${availableSeatClass}).`;

    // Tier 1: Same trip + same seat class
    if (isSameTrip && isSameClass) {
      suggestions.push({
        request: req,
        tier: 1,
        priorityLabel: "Ưu tiên 1: Đúng chuyến & đúng hạng chỗ",
        reason: "Yêu cầu đăng ký chính xác chuyến tàu và hạng chỗ này.",
        suggestedTripId: availableTrip.id,
        suggestedSeatClass: availableSeatClass,
      });
      continue;
    }

    // Tier 2: Same trip + different class (passenger accepts other class)
    if (isSameTrip && !isSameClass && req.acceptOtherClass) {
      suggestions.push({
        request: req,
        tier: 2,
        priorityLabel: "Ưu tiên 2: Cùng chuyến, loại chỗ khác",
        reason: `Hành khách đồng ý đổi loại chỗ (mong muốn: ${req.seatClass}, chỗ trống: ${availableSeatClass}).`,
        suggestedTripId: availableTrip.id,
        suggestedSeatClass: availableSeatClass,
      });
      continue;
    }

    // Tier 3: Same route, same date, other trip (passenger accepts other trip)
    if (
      isSameRoute &&
      dayDifference === 0 &&
      !isSameTrip &&
      req.acceptOtherTrip &&
      classOk
    ) {
      suggestions.push({
        request: req,
        tier: 3,
        priorityLabel: "Ưu tiên 3: Chuyến khác cùng tuyến trong ngày",
        reason: `Hành khách đồng ý đi chuyến khác cùng tuyến (yêu cầu ban đầu: chuyến ${req.trip.code}, chuyến có chỗ: ${availableTrip.code}).${classNote}`,
        suggestedTripId: availableTrip.id,
        suggestedSeatClass: availableSeatClass,
      });
      continue;
    }

    // Tier 4: Same route, date shifted by exactly 1 day (passenger accepts date shift)
    if (isSameRoute && dayDifference === 1 && req.acceptDateShift && classOk) {
      suggestions.push({
        request: req,
        tier: 4,
        priorityLabel: "Ưu tiên 4: Lệch ngày ±1 cùng tuyến",
        reason: `Hành khách đồng ý lệch ±1 ngày (ngày yêu cầu: ${formatDate(req.trip.departureDate)}, chuyến ${availableTrip.code} có chỗ: ${formatDate(availableTrip.departureDate)}).${classNote}`,
        suggestedTripId: availableTrip.id,
        suggestedSeatClass: availableSeatClass,
      });
      continue;
    }
  }

  // Sort by Tier ascending, then by createdAt ascending (earliest request first),
  // then by code so the order is always deterministic.
  suggestions.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    const ta = new Date(a.request.createdAt).getTime();
    const tb = new Date(b.request.createdAt).getTime();
    if (ta !== tb) return ta - tb;
    return a.request.code.localeCompare(b.request.code);
  });

  return suggestions;
}