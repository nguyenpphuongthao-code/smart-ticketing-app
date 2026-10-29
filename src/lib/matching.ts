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

function daysDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Rule-based matching engine for returned/freed seats.
 * Evaluates pending wait requests against a trip and seat class that became available.
 */
export function matchWaitingRequests(
  availableTrip: CandidateTrip,
  availableSeatClass: string,
  availableQuantity: number,
  pendingRequests: CandidateRequest[]
): MatchSuggestion[] {
  const suggestions: MatchSuggestion[] = [];

  for (const req of pendingRequests) {
    if (req.status !== "Đang chờ") continue;
    // Request must fit the freed capacity
    if (req.tickets > availableQuantity) continue;

    const isSameTrip = req.tripId === availableTrip.id;
    const isSameClass = req.seatClass === availableSeatClass;
    const isSameRoute =
      req.trip.origin.trim().toLowerCase() === availableTrip.origin.trim().toLowerCase() &&
      req.trip.destination.trim().toLowerCase() === availableTrip.destination.trim().toLowerCase();
    const dayDifference = Math.abs(daysDiff(req.trip.departureDate, availableTrip.departureDate));

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
    if (isSameRoute && dayDifference === 0 && !isSameTrip && req.acceptOtherTrip) {
      suggestions.push({
        request: req,
        tier: 3,
        priorityLabel: "Ưu tiên 3: Chuyến khác cùng tuyến trong ngày",
        reason: `Hành khách đồng ý đi chuyến khác cùng tuyến (yêu cầu ban đầu: chuyến ${req.trip.code}).`,
        suggestedTripId: availableTrip.id,
        suggestedSeatClass: availableSeatClass,
      });
      continue;
    }

    // Tier 4: Same route, date shifted by ±1 day (passenger accepts date shift)
    if (isSameRoute && dayDifference === 1 && req.acceptDateShift) {
      suggestions.push({
        request: req,
        tier: 4,
        priorityLabel: "Ưu tiên 4: Lệch ngày ±1 cùng tuyến",
        reason: `Hành khách đồng ý lệch ±1 ngày (ngày yêu cầu: ${req.trip.departureDate}, chuyến có chỗ: ${availableTrip.departureDate}).`,
        suggestedTripId: availableTrip.id,
        suggestedSeatClass: availableSeatClass,
      });
      continue;
    }
  }

  // Sort by Tier ascending, then by createdAt ascending (earliest request first)
  suggestions.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return new Date(a.request.createdAt).getTime() - new Date(b.request.createdAt).getTime();
  });

  return suggestions;
}
