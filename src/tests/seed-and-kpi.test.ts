import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  calculateCompletionRate,
  calculateConversionRate,
  calculateAverageReadTimeMinutes,
  calculateWrongNoticeRate,
  calculateAverageCsat,
} from "../lib/kpi";
import { matchWaitingRequests, CandidateTrip, CandidateRequest } from "../lib/matching";

const prisma = new PrismaClient();

describe("Fresh Seed Verification & Business Rules", () => {
  beforeAll(async () => {
    // Connect to database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should have exact counts required for /quan-tri", async () => {
    const pendingRequests = await prisma.waitRequest.findMany({
      where: { status: "Đang chờ" },
      include: { trip: true },
    });

    const matchedRequests = await prisma.waitRequest.findMany({
      where: { status: "Có vé phù hợp" },
    });

    const cancelledRequests = await prisma.waitRequest.findMany({
      where: { status: "Đã hủy" },
    });

    // 1. Yêu cầu đang chờ = 6
    expect(pendingRequests.length).toBe(6);

    // 2. Vé đang chờ = 13
    const waitingTickets = pendingRequests.reduce((sum, r) => sum + r.tickets, 0);
    expect(waitingTickets).toBe(13);

    // 3. Có vé phù hợp = 1
    expect(matchedRequests.length).toBe(1);

    // 4. Đã hủy = 1
    expect(cancelledRequests.length).toBe(1);

    // 5. Waiting tickets by trip: SE31 04/11 = 10, SE11 05/11 = 2, SE12 05/11 = 1
    const se31_04_tickets = pendingRequests
      .filter((r) => r.trip.code === "SE31" && r.trip.departureDate === "2026-11-04")
      .reduce((sum, r) => sum + r.tickets, 0);
    expect(se31_04_tickets).toBe(10);

    const se11_05_tickets = pendingRequests
      .filter((r) => r.trip.code === "SE11" && r.trip.departureDate === "2026-11-05")
      .reduce((sum, r) => sum + r.tickets, 0);
    expect(se11_05_tickets).toBe(2);

    const se12_05_tickets = pendingRequests
      .filter((r) => r.trip.code === "SE12" && r.trip.departureDate === "2026-11-05")
      .reduce((sum, r) => sum + r.tickets, 0);
    expect(se12_05_tickets).toBe(1);
  });

  it("calculates KPI metrics correctly according to formulas", () => {
    // (1) Tỷ lệ hoàn tất đăng ký chờ = request_created / form_started
    expect(calculateCompletionRate(8, 10)).toBe(80.0);
    expect(calculateCompletionRate(0, 0)).toBe(0);

    // (2) Tỷ lệ chuyển thành đặt vé = convertedAt / matchedCount
    expect(calculateConversionRate(1, 2)).toBe(50.0);
    expect(calculateConversionRate(0, 1)).toBe(0);

    // (3) Thời gian phản hồi thông báo
    expect(calculateAverageReadTimeMinutes([10, 20])).toBe(15.0);
    expect(calculateAverageReadTimeMinutes([])).toBe(0);

    // (4) Tỷ lệ thông báo sai
    expect(calculateWrongNoticeRate(1, 10)).toBe(10.0);

    // (5) CSAT trung bình
    expect(calculateAverageCsat([4, 5, 5, 4])).toBe(4.5);
  });

  it("prioritizes matching suggestions correctly (Tier 1 to Tier 4)", () => {
    const returnedTrip: CandidateTrip = {
      id: "trip-a1-04",
      code: "A1",
      origin: "Hà Nội",
      destination: "Đà Nẵng",
      departureDate: "2027-02-04",
      departureTime: "06:00",
    };

    const requests: CandidateRequest[] = [
      {
        id: "r4",
        code: "YC-DATE-SHIFT",
        userId: "u1",
        tripId: "trip-a1-03",
        seatClass: "Ghế ngồi mềm",
        tickets: 1,
        acceptDateShift: true,
        acceptOtherTrip: false,
        acceptOtherClass: false,
        status: "Đang chờ",
        createdAt: new Date("2026-10-25T01:00:00Z"),
        trip: {
          id: "trip-a1-03",
          code: "A1",
          origin: "Hà Nội",
          destination: "Đà Nẵng",
          departureDate: "2027-02-03", // 1 day difference
          departureTime: "06:00",
        },
      },
      {
        id: "r1",
        code: "YC-SAME-EXACT",
        userId: "u2",
        tripId: "trip-a1-04",
        seatClass: "Ghế ngồi mềm",
        tickets: 1,
        acceptDateShift: false,
        acceptOtherTrip: false,
        acceptOtherClass: false,
        status: "Đang chờ",
        createdAt: new Date("2026-10-25T03:00:00Z"),
        trip: returnedTrip,
      },
      {
        id: "r2",
        code: "YC-OTHER-CLASS",
        userId: "u3",
        tripId: "trip-a1-04",
        seatClass: "Giường nằm khoang 4",
        tickets: 1,
        acceptDateShift: false,
        acceptOtherTrip: false,
        acceptOtherClass: true,
        status: "Đang chờ",
        createdAt: new Date("2026-10-25T02:00:00Z"),
        trip: returnedTrip,
      },
    ];

    const results = matchWaitingRequests(returnedTrip, "Ghế ngồi mềm", 2, requests);
    expect(results.length).toBe(3);
    // Tier 1 must be first
    expect(results[0].request.code).toBe("YC-SAME-EXACT");
    expect(results[0].tier).toBe(1);

    // Tier 2 must be second
    expect(results[1].request.code).toBe("YC-OTHER-CLASS");
    expect(results[1].tier).toBe(2);

    // Tier 4 must be third
    expect(results[2].request.code).toBe("YC-DATE-SHIFT");
    expect(results[2].tier).toBe(4);
  });
});
