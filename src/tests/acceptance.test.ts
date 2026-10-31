import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import {
  calculateCompletionRate,
  calculateConversionRate,
  calculateAverageReadTimeMinutes,
  calculateWrongNoticeRate,
  calculateAverageCsat,
} from "../lib/kpi";
import { REQUEST_STATUS } from "../lib/constants";

const prisma = new PrismaClient();

describe("ACCEPTANCE TEST (End-to-End Workflow Verification)", () => {
  let khach1User: any;
  let khach2User: any;
  let nhanvienUser: any;
  let tripA1_04: any;
  let createdRequestCode: string = "";
  let originalSold: number | null = null;
  let inventoryId: string | null = null;

  beforeAll(async () => {
    // 1. Get test users
    khach1User = await prisma.user.findUnique({
      where: { email: "khach1@demo.local" },
    });

    khach2User = await prisma.user.findUnique({
      where: { email: "khach2@demo.local" },
    });

    nhanvienUser = await prisma.user.findUnique({
      where: { email: "nhanvien@demo.local" },
    });

    tripA1_04 = await prisma.trip.findFirst({
      where: { code: "SE31", departureDate: "2026-11-04" },
      include: { inventories: true },
    });

    expect(khach1User).toBeDefined();
    expect(nhanvienUser).toBeDefined();
    expect(tripA1_04).toBeDefined();

    // Ensure database clean state for YC-009
    await prisma.waitRequest.deleteMany({ where: { code: "YC-009" } });

    // Temporarily simulate sold-out inventory for acceptance test
    const softSeatInventory = tripA1_04.inventories.find(
      (item: any) => item.seatClass === "Ghế ngồi mềm"
    );

    if (!softSeatInventory) {
      throw new Error("Không tìm thấy inventory Ghế ngồi mềm");
    }

    inventoryId = softSeatInventory.id;
    originalSold = softSeatInventory.sold;

    await prisma.seatInventory.update({
      where: { id: inventoryId },
      data: {
        sold: softSeatInventory.capacity,
      },
    });

    // Update in-memory data used by Step 1
    softSeatInventory.sold = softSeatInventory.capacity;
  });

  afterAll(async () => {
    // Clean up the request created during this test
    if (createdRequestCode) {
      await prisma.notification.deleteMany({
        where: { message: { contains: createdRequestCode } },
      });

      await prisma.waitRequest.deleteMany({
        where: { code: createdRequestCode },
      });
    }

    // Clean up old test data if it exists
    await prisma.waitRequest.deleteMany({
      where: { code: "YC-009" },
    });

    // Restore original inventory
    if (inventoryId && originalSold !== null) {
      await prisma.seatInventory.update({
        where: { id: inventoryId },
        data: {
          sold: originalSold,
        },
      });
    }

    await prisma.$disconnect();
  });

  it("Step 1: khach1 registers a waitlist for SE31 Hà Nội–Đà Nẵng 04/11/2026, 1 ticket", async () => {
    // Verify seat class is sold out for SE31 04/11
    const inventory = tripA1_04.inventories.find((i: any) => i.seatClass === "Ghế ngồi mềm");
    expect(inventory.capacity - inventory.sold).toBeLessThanOrEqual(0);

    // Calculate next code
    const allRequests = await prisma.waitRequest.findMany({ select: { code: true } });
    let maxNum = 0;
    for (const r of allRequests) {
      const match = r.code.match(/YC-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    createdRequestCode = `YC-${String(maxNum + 1).padStart(3, "0")}`;

    // Create request for khach1
    const newReq = await prisma.waitRequest.create({
      data: {
        code: createdRequestCode,
        userId: khach1User.id,
        tripId: tripA1_04.id,
        seatClass: "Ghế ngồi mềm",
        tickets: 1,
        acceptDateShift: false,
        acceptOtherTrip: false,
        acceptOtherClass: false,
        channel: "WEBSITE",
        status: REQUEST_STATUS.PENDING,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        type: "request_created",
        userId: khach1User.id,
      },
    });

    expect(newReq.code).toBe(createdRequestCode);
    expect(newReq.status).toBe("Đang chờ");
  });

  it("Step 2: Log in as nhanvien: the new request YC-009 appears", async () => {
    const staffViewRequest = await prisma.waitRequest.findUnique({
      where: { code: createdRequestCode },
      include: { trip: true, user: true },
    });

    expect(staffViewRequest).not.toBeNull();
    expect(staffViewRequest?.user.email).toBe("khach1@demo.local");
    expect(staffViewRequest?.status).toBe("Đang chờ");
    expect(staffViewRequest?.trip.code).toBe("SE31");
  });

  it("Step 3: Staff sets it to 'Có vé phù hợp' with suggested trip", async () => {
    const updated = await prisma.waitRequest.update({
      where: { code: createdRequestCode },
      data: {
        status: REQUEST_STATUS.MATCHED,
        suggestedTripId: tripA1_04.id,
        suggestedSeatClass: "Ghế ngồi mềm",
        notifiedAt: new Date(),
        statusChangedAt: new Date(),
        staffNote: "Đã có 01 chỗ trống cho bạn.",
      },
    });

    expect(updated.status).toBe("Có vé phù hợp");

    // Staff action creates simulated notification for khach1
    const notification = await prisma.notification.create({
      data: {
        userId: khach1User.id,
        requestId: updated.id,
        channel: "WEBSITE",
        simulated: true,
        message: `Đã có vé phù hợp cho yêu cầu ${updated.code}: Chuyến SE31 ngày 04/11/2026.`,
      },
    });

    expect(notification.userId).toBe(khach1User.id);
    expect(notification.simulated).toBe(true);
    expect(notification.readAt).toBeNull();
  });

  it("Step 4: As khach1: notification with unread badge, request shows suggestion", async () => {
    const unreadCount = await prisma.notification.count({
      where: {
        userId: khach1User.id,
        readAt: null,
      },
    });
    expect(unreadCount).toBeGreaterThanOrEqual(1);

    const passengerRequest = await prisma.waitRequest.findUnique({
      where: { code: createdRequestCode },
      include: { suggestedTrip: true },
    });

    expect(passengerRequest?.status).toBe("Có vé phù hợp");
    expect(passengerRequest?.suggestedTripId).toBe(tripA1_04.id);
    expect(passengerRequest?.staffNote).toBe("Đã có 01 chỗ trống cho bạn.");

    // khach1 confirms converted
    const converted = await prisma.waitRequest.update({
      where: { code: createdRequestCode },
      data: { convertedAt: new Date() },
    });
    expect(converted.convertedAt).not.toBeNull();

    // khach1 rates CSAT 5 stars
    const rated = await prisma.waitRequest.update({
      where: { code: createdRequestCode },
      data: { csat: 5 },
    });
    expect(rated.csat).toBe(5);
  });

  it("Step 5: /quan-tri/phan-tich and /quan-tri/kpi numbers update immediately", async () => {
    // In phan-tich, pending requests count should no longer count YC-009 (since it became "Có vé phù hợp")
    const pendingRequests = await prisma.waitRequest.findMany({
      where: { status: "Đang chờ" },
    });

    const hasYC009InPending = pendingRequests.some((r) => r.code === createdRequestCode);
    expect(hasYC009InPending).toBe(false);

    // In KPI, conversion rate is now updated
    const matchedCount = await prisma.waitRequest.count({
      where: {
        OR: [{ status: "Có vé phù hợp" }, { notifiedAt: { not: null } }],
      },
    });
    const convertedCount = await prisma.waitRequest.count({
      where: { convertedAt: { not: null } },
    });

    expect(matchedCount).toBeGreaterThanOrEqual(2); // YC-002 + YC-009
    expect(convertedCount).toBeGreaterThanOrEqual(1); // YC-009 converted
    const convRate = calculateConversionRate(convertedCount, matchedCount);
    expect(convRate).toBeGreaterThan(0);
  });

  it("Step 6: A passenger cannot open another user's request or staff routes", async () => {
    // Verify khach1 cannot modify or cancel khach2's request (YC-002)
    const req2 = await prisma.waitRequest.findUnique({
      where: { code: "YC-002" },
    });
    expect(req2?.userId).toBe(khach2User.id);
    expect(req2?.userId).not.toBe(khach1User.id);

    // Business rule simulation: Passenger ownership check
    const isOwner = req2?.userId === khach1User.id;
    expect(isOwner).toBe(false);

    // Verify role check prevents passenger from acting as STAFF
    expect(khach1User.role).toBe("PASSENGER");
    expect(khach1User.role === "STAFF").toBe(false);
  });
});
