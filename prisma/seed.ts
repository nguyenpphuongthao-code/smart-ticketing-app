import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Bắt đầu khởi tạo dữ liệu mẫu (Seed Data) ---");

  // 1. Dọn dẹp dữ liệu cũ (đảm bảo tính idempotent)
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.analyticsEvent.deleteMany({});
  await prisma.waitRequest.deleteMany({});
  await prisma.seatInventory.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Tạo tài khoản mẫu (Mật khẩu: Demo@12345)
  const passwordHash = await bcrypt.hash("Demo@12345", 10);

  const staffUser = await prisma.user.create({
    data: {
      email: "nhanvien@demo.local",
      name: "Nhân viên điều hành (giả lập)",
      passwordHash,
      role: "STAFF",
      defaultChannel: "WEBSITE",
      phone: "0987654321",
    },
  });

  const passenger1 = await prisma.user.create({
    data: {
      email: "khach1@demo.local",
      name: "Nguyễn Văn An (giả lập)",
      passwordHash,
      role: "PASSENGER",
      defaultChannel: "WEBSITE",
      phone: "0901234567",
    },
  });

  const passenger2 = await prisma.user.create({
    data: {
      email: "khach2@demo.local",
      name: "Trần Thị Bình (giả lập)",
      passwordHash,
      role: "PASSENGER",
      defaultChannel: "EMAIL",
      phone: "0912345678",
    },
  });

  const passenger3 = await prisma.user.create({
    data: {
      email: "khach3@demo.local",
      name: "Lê Hoàng Cường (giả lập)",
      passwordHash,
      role: "PASSENGER",
      defaultChannel: "SMS",
      phone: "0923456789",
    },
  });

  const passenger4 = await prisma.user.create({
    data: {
      email: "khach4@demo.local",
      name: "Phạm Minh Đức (giả lập)",
      passwordHash,
      role: "PASSENGER",
      defaultChannel: "WEBSITE",
      phone: "0934567890",
    },
  });

  const passenger5 = await prisma.user.create({
    data: {
      email: "khach5@demo.local",
      name: "Hoàng Ngọc Lan (giả lập)",
      passwordHash,
      role: "PASSENGER",
      defaultChannel: "EMAIL",
      phone: "0945678901",
    },
  });

  console.log("-> Đã tạo 1 STAFF và 5 PASSENGERS");

  // 3. Tạo các chuyến tàu
  // A1: Hà Nội - Đà Nẵng
  const tripA1_03 = await prisma.trip.create({
    data: {
      code: "A1",
      origin: "Hà Nội",
      destination: "Đà Nẵng",
      departureDate: "2027-02-03",
      departureTime: "06:00",
      inventories: {
        create: [
          { seatClass: "Ghế ngồi mềm", capacity: 50, sold: 35 },
          { seatClass: "Giường nằm khoang 4", capacity: 28, sold: 20 },
          { seatClass: "Giường nằm khoang 6", capacity: 42, sold: 30 },
        ],
      },
    },
  });

  const tripA1_04 = await prisma.trip.create({
    data: {
      code: "A1",
      origin: "Hà Nội",
      destination: "Đà Nẵng",
      departureDate: "2027-02-04",
      departureTime: "06:00",
      inventories: {
        create: [
          { seatClass: "Ghế ngồi mềm", capacity: 50, sold: 50 }, // Sold out
          { seatClass: "Giường nằm khoang 4", capacity: 28, sold: 28 }, // Sold out
          { seatClass: "Giường nằm khoang 6", capacity: 42, sold: 42 }, // Sold out
        ],
      },
    },
  });

  const tripA1_05 = await prisma.trip.create({
    data: {
      code: "A1",
      origin: "Hà Nội",
      destination: "Đà Nẵng",
      departureDate: "2027-02-05",
      departureTime: "06:00",
      inventories: {
        create: [
          { seatClass: "Ghế ngồi mềm", capacity: 50, sold: 42 }, // 8 seats left
          { seatClass: "Giường nằm khoang 4", capacity: 28, sold: 28 }, // Sold out
          { seatClass: "Giường nằm khoang 6", capacity: 42, sold: 42 }, // Sold out
        ],
      },
    },
  });

  // B2: Hà Nội - Vinh
  const tripB2_05 = await prisma.trip.create({
    data: {
      code: "B2",
      origin: "Hà Nội",
      destination: "Vinh",
      departureDate: "2027-02-05",
      departureTime: "14:30",
      inventories: {
        create: [
          { seatClass: "Ghế ngồi mềm", capacity: 60, sold: 60 }, // Sold out
          { seatClass: "Giường nằm khoang 4", capacity: 32, sold: 32 }, // Sold out
          { seatClass: "Giường nằm khoang 6", capacity: 48, sold: 48 }, // Sold out
        ],
      },
    },
  });

  const tripB2_06 = await prisma.trip.create({
    data: {
      code: "B2",
      origin: "Hà Nội",
      destination: "Vinh",
      departureDate: "2027-02-06",
      departureTime: "14:30",
      inventories: {
        create: [
          { seatClass: "Ghế ngồi mềm", capacity: 60, sold: 45 },
          { seatClass: "Giường nằm khoang 4", capacity: 32, sold: 25 },
          { seatClass: "Giường nằm khoang 6", capacity: 48, sold: 40 },
        ],
      },
    },
  });

  // C3: Sài Gòn - Nha Trang
  const tripC3_05 = await prisma.trip.create({
    data: {
      code: "C3",
      origin: "Sài Gòn",
      destination: "Nha Trang",
      departureDate: "2027-02-05",
      departureTime: "20:00",
      inventories: {
        create: [
          { seatClass: "Ghế ngồi mềm", capacity: 50, sold: 50 }, // Sold out
          { seatClass: "Giường nằm khoang 4", capacity: 28, sold: 28 }, // Sold out
          { seatClass: "Giường nằm khoang 6", capacity: 42, sold: 42 }, // Sold out
        ],
      },
    },
  });

  console.log("-> Đã tạo 6 chuyến tàu mẫu kèm kho chỗ SeatInventory");

  // 4. Tạo các yêu cầu chờ (YC-001 đến YC-008)
  // YC-001: A1 04/02 2 vé "Lệch ±1 ngày" Đang chờ (khach1)
  await prisma.waitRequest.create({
    data: {
      code: "YC-001",
      userId: passenger1.id,
      tripId: tripA1_04.id,
      seatClass: "Ghế ngồi mềm",
      tickets: 2,
      acceptDateShift: true,
      acceptOtherTrip: false,
      acceptOtherClass: false,
      channel: "WEBSITE",
      status: "Đang chờ",
      createdAt: new Date("2026-10-25T08:00:00Z"),
      statusChangedAt: new Date("2026-10-25T08:00:00Z"),
    },
  });

  // YC-002: A1 04/02 1 vé không thay thế Có vé phù hợp (khach2)
  const req2 = await prisma.waitRequest.create({
    data: {
      code: "YC-002",
      userId: passenger2.id,
      tripId: tripA1_04.id,
      seatClass: "Ghế ngồi mềm",
      tickets: 1,
      acceptDateShift: false,
      acceptOtherTrip: false,
      acceptOtherClass: false,
      channel: "EMAIL",
      status: "Có vé phù hợp",
      suggestedTripId: tripA1_04.id,
      suggestedSeatClass: "Ghế ngồi mềm",
      staffNote: "Hệ thống ghi nhận có 01 vé trả của chuyến A1 ngày 04/02/2027.",
      notifiedAt: new Date("2026-10-26T09:30:00Z"),
      createdAt: new Date("2026-10-25T08:15:00Z"),
      statusChangedAt: new Date("2026-10-26T09:30:00Z"),
    },
  });

  // Tạo Notification giả lập cho YC-002
  await prisma.notification.create({
    data: {
      userId: passenger2.id,
      requestId: req2.id,
      channel: "EMAIL",
      simulated: true,
      message:
        "Đã có vé phù hợp cho yêu cầu YC-002: Chuyến A1 (Hà Nội - Đà Nẵng) ngày 04/02/2027, loại chỗ Ghế ngồi mềm. Vui lòng truy cập kênh bán vé chính thức để đặt chỗ.",
      createdAt: new Date("2026-10-26T09:30:00Z"),
      readAt: new Date("2026-10-26T09:45:00Z"), // Đã đọc sau 15 phút
    },
  });

  // YC-003: B2 05/02 3 vé "Chuyến khác cùng tuyến" Đã hủy (khach3)
  await prisma.waitRequest.create({
    data: {
      code: "YC-003",
      userId: passenger3.id,
      tripId: tripB2_05.id,
      seatClass: "Ghế ngồi mềm",
      tickets: 3,
      acceptDateShift: false,
      acceptOtherTrip: true,
      acceptOtherClass: false,
      channel: "SMS",
      status: "Đã hủy",
      cancelledAt: new Date("2026-10-26T11:00:00Z"),
      cancelReason: "Kế hoạch gia đình thay đổi, đã chuyển sang phương tiện khác",
      createdAt: new Date("2026-10-25T09:00:00Z"),
      statusChangedAt: new Date("2026-10-26T11:00:00Z"),
    },
  });

  // YC-004: A1 04/02 4 vé "Lệch ±1 ngày" Đang chờ (khach4)
  await prisma.waitRequest.create({
    data: {
      code: "YC-004",
      userId: passenger4.id,
      tripId: tripA1_04.id,
      seatClass: "Ghế ngồi mềm",
      tickets: 4,
      acceptDateShift: true,
      acceptOtherTrip: false,
      acceptOtherClass: false,
      channel: "WEBSITE",
      status: "Đang chờ",
      createdAt: new Date("2026-10-25T10:00:00Z"),
      statusChangedAt: new Date("2026-10-25T10:00:00Z"),
    },
  });

  // YC-005: A1 04/02 2 vé "Loại chỗ khác" Đang chờ (khach5)
  await prisma.waitRequest.create({
    data: {
      code: "YC-005",
      userId: passenger5.id,
      tripId: tripA1_04.id,
      seatClass: "Ghế ngồi mềm",
      tickets: 2,
      acceptDateShift: false,
      acceptOtherTrip: false,
      acceptOtherClass: true,
      channel: "EMAIL",
      status: "Đang chờ",
      createdAt: new Date("2026-10-25T11:30:00Z"),
      statusChangedAt: new Date("2026-10-25T11:30:00Z"),
    },
  });

  // YC-006: C3 05/02 1 vé không thay thế Đang chờ (khach1)
  await prisma.waitRequest.create({
    data: {
      code: "YC-006",
      userId: passenger1.id,
      tripId: tripC3_05.id,
      seatClass: "Ghế ngồi mềm",
      tickets: 1,
      acceptDateShift: false,
      acceptOtherTrip: false,
      acceptOtherClass: false,
      channel: "WEBSITE",
      status: "Đang chờ",
      createdAt: new Date("2026-10-25T14:00:00Z"),
      statusChangedAt: new Date("2026-10-25T14:00:00Z"),
    },
  });

  // YC-007: A1 04/02 2 vé "Chuyến khác cùng tuyến" Đang chờ (khach2)
  await prisma.waitRequest.create({
    data: {
      code: "YC-007",
      userId: passenger2.id,
      tripId: tripA1_04.id,
      seatClass: "Ghế ngồi mềm",
      tickets: 2,
      acceptDateShift: false,
      acceptOtherTrip: true,
      acceptOtherClass: false,
      channel: "EMAIL",
      status: "Đang chờ",
      createdAt: new Date("2026-10-25T15:20:00Z"),
      statusChangedAt: new Date("2026-10-25T15:20:00Z"),
    },
  });

  // YC-008: B2 05/02 2 vé "Lệch ±1 ngày" Đang chờ (khach3)
  await prisma.waitRequest.create({
    data: {
      code: "YC-008",
      userId: passenger3.id,
      tripId: tripB2_05.id,
      seatClass: "Ghế ngồi mềm",
      tickets: 2,
      acceptDateShift: true,
      acceptOtherTrip: false,
      acceptOtherClass: false,
      channel: "SMS",
      status: "Đang chờ",
      createdAt: new Date("2026-10-25T16:45:00Z"),
      statusChangedAt: new Date("2026-10-25T16:45:00Z"),
    },
  });

  console.log("-> Đã tạo 8 yêu cầu chờ mẫu (YC-001 đến YC-008)");

  // 5. Ghi nhật ký phân tích (AnalyticsEvent) & AuditLog ban đầu
  // 10 lượt mở form, 8 lượt tạo thành công
  for (let i = 0; i < 10; i++) {
    const hour = String(7 + (i % 4)).padStart(2, "0");
    const minute = String(10 + i * 3).padStart(2, "0");
    await prisma.analyticsEvent.create({
      data: {
        type: "form_started",
        createdAt: new Date(`2026-10-25T${hour}:${minute}:00Z`),
      },
    });
  }

  for (let i = 0; i < 8; i++) {
    const hour = String(8 + (i % 4)).padStart(2, "0");
    const minute = String(15 + i * 4).padStart(2, "0");
    await prisma.analyticsEvent.create({
      data: {
        type: "request_created",
        createdAt: new Date(`2026-10-25T${hour}:${minute}:00Z`),
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: staffUser.id,
      action: "INIT_SEED",
      entity: "SYSTEM",
      entityId: "system",
      after: JSON.stringify({ message: "Khởi tạo dữ liệu mẫu ban đầu" }),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: staffUser.id,
      action: "UPDATE_STATUS",
      entity: "WaitRequest",
      entityId: req2.id,
      before: JSON.stringify({ status: "Đang chờ" }),
      after: JSON.stringify({
        status: "Có vé phù hợp",
        suggestedTrip: "A1",
        suggestedSeatClass: "Ghế ngồi mềm",
      }),
    },
  });

  console.log("--- Khởi tạo dữ liệu mẫu THÀNH CÔNG! ---");
}

main()
  .catch((e) => {
    console.error("Lỗi khởi tạo dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
