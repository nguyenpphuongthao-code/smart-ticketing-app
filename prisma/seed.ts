import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface CsvTripRow {
  code: string;
  direction: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  seatClass: string;
  capacity: number;
  sold: number;
}

async function main() {
  console.log("--- Bắt đầu nạp dữ liệu chuyến tàu thật từ data/trips_dataset.csv ---");

  // 1. Dọn dẹp dữ liệu cũ (đảm bảo tính idempotent)
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.analyticsEvent.deleteMany({});
  await prisma.waitRequest.deleteMany({});
  await prisma.seatInventory.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Tạo tài khoản mẫu chính thức: 1 nhân viên, 1 khách hàng
  const staffOfficialHash = await bcrypt.hash("NhanVien@2027", 10);
  const passengerOfficialHash = await bcrypt.hash("HanhKhach@2027", 10);
  const passwordHash = await bcrypt.hash("Demo@12345", 10);

  // Tài khoản chính thức 1: Nhân viên điều hành
  await prisma.user.create({
    data: {
      email: "nhanvien@chovethongminh.vn",
      name: "Nguyễn Quản Trị (Nhân viên điều hành)",
      passwordHash: staffOfficialHash,
      role: "STAFF",
      defaultChannel: "WEBSITE",
      phone: "0987654321",
    },
  });

  // Tài khoản chính thức 2: Hành khách
  await prisma.user.create({
    data: {
      email: "hanhkhach@chovethongminh.vn",
      name: "Trần Hành Khách",
      passwordHash: passengerOfficialHash,
      role: "PASSENGER",
      defaultChannel: "WEBSITE",
      phone: "0901234567",
    },
  });

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

  console.log("-> Đã tạo các tài khoản người dùng (STAFF và PASSENGER)");

  // 3. Đọc dữ liệu thật từ data/trips_dataset.csv
  const csvPath = path.join(process.cwd(), "data/trips_dataset.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Không tìm thấy file dataset: ${csvPath}`);
  }

  const fileContent = fs.readFileSync(csvPath, "utf8");
  const lines = fileContent.trim().split("\n");

  const tripGroups = new Map<
    string,
    {
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
  >();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 9) continue;

    const [code, , origin, destination, departureDate, departureTime, seatClass, capacityStr, soldStr] = parts;
    const capacity = parseInt(capacityStr, 10) || 0;
    const sold = parseInt(soldStr, 10) || 0;

    const tripKey = `${code}|${origin}|${destination}|${departureDate}|${departureTime}`;
    if (!tripGroups.has(tripKey)) {
      tripGroups.set(tripKey, {
        code,
        origin,
        destination,
        departureDate,
        departureTime,
        inventories: [],
      });
    }

    tripGroups.get(tripKey)!.inventories.push({
      seatClass,
      capacity,
      sold,
    });
  }

  console.log(`-> Đã phân tích ${tripGroups.size} chuyến tàu thật từ CSV.`);

  // Nạp các chuyến tàu vào Database theo từng đợt
  const createdTripsMap = new Map<string, any>();

  for (const tripData of tripGroups.values()) {
    const createdTrip = await prisma.trip.create({
      data: {
        code: tripData.code,
        origin: tripData.origin,
        destination: tripData.destination,
        departureDate: tripData.departureDate,
        departureTime: tripData.departureTime,
        inventories: {
          create: tripData.inventories.map((inv) => ({
            seatClass: inv.seatClass,
            capacity: inv.capacity,
            sold: inv.sold,
          })),
        },
      },
      include: {
        inventories: true,
      },
    });

    const key = `${tripData.code}_${tripData.departureDate}`;
    createdTripsMap.set(key, createdTrip);
  }

  console.log(`-> Đã nạp thành công ${createdTripsMap.size} chuyến tàu thật kèm SeatInventory vào cơ sở dữ liệu.`);

  // 4. Tìm các chuyến trọng điểm phục vụ kịch bản chờ vé & KPI
  // SE31: Hà Nội - Đà Nẵng ngày 2026-11-04 (Chuyến chính có nhu cầu cao nhất)
  const tripSE31_04 = createdTripsMap.get("SE31_2026-11-04");
  const tripSE11_05 = createdTripsMap.get("SE11_2026-11-05");
  const tripSE12_05 = createdTripsMap.get("SE12_2026-11-05");

  if (!tripSE31_04 || !tripSE11_05 || !tripSE12_05) {
    throw new Error("Không tìm thấy các chuyến SE31, SE11, SE12 trong dataset CSV.");
  }

  // Đảm bảo các chuyến có danh sách chờ thực tế (SE31, SE11, SE12) ở trạng thái hết vé (sold = capacity)
  await prisma.seatInventory.updateMany({
    where: {
      tripId: { in: [tripSE31_04.id, tripSE11_05.id, tripSE12_05.id] },
      seatClass: "Ghế ngồi mềm",
    },
    data: { sold: 50 },
  });

  // 5. Tạo các yêu cầu chờ mẫu (YC-001 đến YC-008) gắn với các chuyến tàu thật
  // YC-001: SE31 04/11 2 vé "Lệch ±1 ngày" Đang chờ (khach1)
  await prisma.waitRequest.create({
    data: {
      code: "YC-001",
      userId: passenger1.id,
      tripId: tripSE31_04.id,
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

  // YC-002: SE31 04/11 1 vé không thay thế Có vé phù hợp (khach2)
  const req2 = await prisma.waitRequest.create({
    data: {
      code: "YC-002",
      userId: passenger2.id,
      tripId: tripSE31_04.id,
      seatClass: "Ghế ngồi mềm",
      tickets: 1,
      acceptDateShift: false,
      acceptOtherTrip: false,
      acceptOtherClass: false,
      channel: "EMAIL",
      status: "Có vé phù hợp",
      suggestedTripId: tripSE31_04.id,
      suggestedSeatClass: "Ghế ngồi mềm",
      staffNote: "Hệ thống ghi nhận có 01 vé trả của chuyến SE31 ngày 04/11/2026.",
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
        "Đã có vé phù hợp cho yêu cầu YC-002: Chuyến SE31 (Hà Nội - Đà Nẵng) ngày 04/11/2026, loại chỗ Ghế ngồi mềm. Vui lòng truy cập kênh bán vé chính thức để đặt chỗ.",
      createdAt: new Date("2026-10-26T09:30:00Z"),
      readAt: new Date("2026-10-26T09:45:00Z"), // Đã đọc sau 15 phút
    },
  });

  // YC-003: SE11 05/11 3 vé "Chuyến khác cùng tuyến" Đã hủy (khach3)
  await prisma.waitRequest.create({
    data: {
      code: "YC-003",
      userId: passenger3.id,
      tripId: tripSE11_05.id,
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

  // YC-004: SE31 04/11 4 vé "Lệch ±1 ngày" Đang chờ (khach4)
  await prisma.waitRequest.create({
    data: {
      code: "YC-004",
      userId: passenger4.id,
      tripId: tripSE31_04.id,
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

  // YC-005: SE31 04/11 2 vé "Loại chỗ khác" Đang chờ (khach5)
  await prisma.waitRequest.create({
    data: {
      code: "YC-005",
      userId: passenger5.id,
      tripId: tripSE31_04.id,
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

  // YC-006: SE12 05/11 1 vé không thay thế Đang chờ (khach1)
  await prisma.waitRequest.create({
    data: {
      code: "YC-006",
      userId: passenger1.id,
      tripId: tripSE12_05.id,
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

  // YC-007: SE31 04/11 2 vé "Chuyến khác cùng tuyến" Đang chờ (khach2)
  await prisma.waitRequest.create({
    data: {
      code: "YC-007",
      userId: passenger2.id,
      tripId: tripSE31_04.id,
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

  // YC-008: SE11 05/11 2 vé "Lệch ±1 ngày" Đang chờ (khach3)
  await prisma.waitRequest.create({
    data: {
      code: "YC-008",
      userId: passenger3.id,
      tripId: tripSE11_05.id,
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

  console.log("-> Đã tạo 8 yêu cầu chờ thực tế (YC-001 đến YC-008)");

  // 6. Ghi nhật ký phân tích (AnalyticsEvent) & AuditLog ban đầu
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
      after: JSON.stringify({ message: "Khởi tạo dữ liệu từ trips_dataset.csv thành công" }),
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
        suggestedTrip: "SE31",
        suggestedSeatClass: "Ghế ngồi mềm",
      }),
    },
  });

  console.log("--- Khởi tạo toàn bộ dữ liệu thật THÀNH CÔNG! ---");
}

main()
  .catch((e) => {
    console.error("Lỗi khởi tạo dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
