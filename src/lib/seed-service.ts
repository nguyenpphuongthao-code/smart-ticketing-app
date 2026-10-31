import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export interface SeedResult {
    tripsCount: number;
    inventoriesCount: number;
    usersCount: number;
    requestsCount: number;
}

/**
 * Parses data/trips_dataset.csv and seeds/updates the database.
 * Can be called during `prisma db seed`, on startup if needed, or via admin action.
 */
export async function seedRealTripsAndData(prismaClient: PrismaClient): Promise<SeedResult> {
    console.log("--- Bắt đầu nạp dữ liệu chuyến tàu thật từ data/trips_dataset.csv ---");

    // 1. Dọn dẹp dữ liệu cũ (chỉ dọn dữ liệu demo, BẢO LƯU tài khoản người dùng đã tạo)
    const demoEmails = [
        "nhanvien@chovethongminh.vn",
        "hanhkhach@chovethongminh.vn",
        "nhanvien@demo.local",
        "khach1@demo.local",
        "khach2@demo.local",
        "khach3@demo.local",
        "khach4@demo.local",
        "khach5@demo.local",
    ];

    await prismaClient.notification.deleteMany({});
    await prismaClient.auditLog.deleteMany({});
    await prismaClient.analyticsEvent.deleteMany({});
    await prismaClient.waitRequest.deleteMany({});
    await prismaClient.seatInventory.deleteMany({});
    await prismaClient.trip.deleteMany({});
    // Chỉ xóa các user demo khi seed lại, TUYỆT ĐỐI không xóa user người dùng tự tạo
    await prismaClient.user.deleteMany({
        where: {
            email: { in: demoEmails },
        },
    });

    // 2. Tạo tài khoản mẫu chính thức: 1 nhân viên, 1 khách hàng
    const staffOfficialHash = await bcrypt.hash("NhanVien@2027", 10);
    const passengerOfficialHash = await bcrypt.hash("HanhKhach@2027", 10);
    const passwordHash = await bcrypt.hash("Demo@12345", 10);

    // Tài khoản chính thức 1: Nhân viên điều hành
    await prismaClient.user.create({
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
    await prismaClient.user.create({
        data: {
            email: "hanhkhach@chovethongminh.vn",
            name: "Trần Hành Khách",
            passwordHash: passengerOfficialHash,
            role: "PASSENGER",
            defaultChannel: "WEBSITE",
            phone: "0901234567",
        },
    });

    const staffUser = await prismaClient.user.create({
        data: {
            email: "nhanvien@demo.local",
            name: "Nhân viên điều hành (giả lập)",
            passwordHash,
            role: "STAFF",
            defaultChannel: "WEBSITE",
            phone: "0987654321",
        },
    });

    const passenger1 = await prismaClient.user.create({
        data: {
            email: "khach1@demo.local",
            name: "Nguyễn Văn An (giả lập)",
            passwordHash,
            role: "PASSENGER",
            defaultChannel: "WEBSITE",
            phone: "0901234567",
        },
    });

    const passenger2 = await prismaClient.user.create({
        data: {
            email: "khach2@demo.local",
            name: "Trần Thị Bình (giả lập)",
            passwordHash,
            role: "PASSENGER",
            defaultChannel: "EMAIL",
            phone: "0912345678",
        },
    });

    const passenger3 = await prismaClient.user.create({
        data: {
            email: "khach3@demo.local",
            name: "Lê Hoàng Cường (giả lập)",
            passwordHash,
            role: "PASSENGER",
            defaultChannel: "SMS",
            phone: "0923456789",
        },
    });

    const passenger4 = await prismaClient.user.create({
        data: {
            email: "khach4@demo.local",
            name: "Phạm Minh Đức (giả lập)",
            passwordHash,
            role: "PASSENGER",
            defaultChannel: "WEBSITE",
            phone: "0934567890",
        },
    });

    const passenger5 = await prismaClient.user.create({
        data: {
            email: "khach5@demo.local",
            name: "Hoàng Ngọc Lan (giả lập)",
            passwordHash,
            role: "PASSENGER",
            defaultChannel: "EMAIL",
            phone: "0945678901",
        },
    });

    // 2.1. Đảm bảo tất cả tài khoản trong allowed_accounts.json luôn tồn tại trong DB
    try {
        const allowedPathCandidates = [
            path.join(process.cwd(), "data/allowed_accounts.json"),
            path.join(__dirname, "../../data/allowed_accounts.json"),
            path.join(__dirname, "../data/allowed_accounts.json"),
            path.resolve("data/allowed_accounts.json"),
            "/app/data/allowed_accounts.json",
        ];
        const allowedPath = allowedPathCandidates.find((p) => fs.existsSync(p));
        if (allowedPath) {
            const allowedAccounts = JSON.parse(fs.readFileSync(allowedPath, "utf-8"));
            for (const acc of allowedAccounts) {
                if (!acc.email || demoEmails.includes(acc.email)) continue;
                const exists = await prismaClient.user.findUnique({
                    where: { email: acc.email.toLowerCase().trim() },
                });
                if (!exists) {
                    const defaultHash = acc.role === "STAFF" ? staffOfficialHash : passengerOfficialHash;
                    await prismaClient.user.create({
                        data: {
                            email: acc.email.toLowerCase().trim(),
                            name: acc.name || acc.email.split("@")[0],
                            passwordHash: defaultHash,
                            role: acc.role === "STAFF" ? "STAFF" : "PASSENGER",
                            defaultChannel: "WEBSITE",
                        },
                    });
                }
            }
        }
    } catch (err) {
        console.error("Lỗi đồng bộ allowed_accounts.json trong seed-service:", err);
    }

    // 3. Đọc dữ liệu thật từ data/trips_dataset.csv
    const possiblePaths = [
        path.join(process.cwd(), "data/trips_dataset.csv"),
        path.join(__dirname, "../data/trips_dataset.csv"),
        path.join(__dirname, "../../data/trips_dataset.csv"),
        path.resolve("data/trips_dataset.csv"),
        "/app/data/trips_dataset.csv",
    ];

    const csvPath = possiblePaths.find((p) => fs.existsSync(p));
    if (!csvPath) {
        throw new Error(
            `Không tìm thấy file dataset: ${possiblePaths[0]}. Đã tìm qua: ${possiblePaths.join(", ")}`
        );
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

    // Nạp các chuyến tàu vào Database
    const createdTripsMap = new Map<string, any>();
    let totalInventories = 0;

    for (const tripData of tripGroups.values()) {
        const createdTrip = await prismaClient.trip.create({
            data: {
                code: tripData.code,
                origin: tripData.origin,
                destination: tripData.destination,
                departureDate: tripData.departureDate,
                departureTime: tripData.departureTime,
                inventories: {
                    create: tripData.inventories.map((inv) => {
                        totalInventories++;
                        return {
                            seatClass: inv.seatClass,
                            capacity: inv.capacity,
                            sold: inv.sold,
                        };
                    }),
                },
            },
            include: {
                inventories: true,
            },
        });

        const key = `${tripData.code}_${tripData.departureDate}`;
        createdTripsMap.set(key, createdTrip);
    }

    // 4. Tìm các chuyến trọng điểm phục vụ kịch bản chờ vé & KPI
    const tripSE31_04 = createdTripsMap.get("SE31_2026-11-04");
    const tripSE11_05 = createdTripsMap.get("SE11_2026-11-05");
    const tripSE12_05 = createdTripsMap.get("SE12_2026-11-05");

    if (!tripSE31_04 || !tripSE11_05 || !tripSE12_05) {
        throw new Error("Không tìm thấy các chuyến SE31, SE11, SE12 trong dataset CSV.");
    }

    // 5. Tạo các yêu cầu chờ mẫu (YC-001 đến YC-008) gắn với các chuyến tàu thật
    await prismaClient.waitRequest.create({
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

    const req2 = await prismaClient.waitRequest.create({
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

    await prismaClient.notification.create({
        data: {
            userId: passenger2.id,
            requestId: req2.id,
            channel: "EMAIL",
            simulated: true,
            message:
                "Đã có vé phù hợp cho yêu cầu YC-002: Chuyến SE31 (Hà Nội - Đà Nẵng) ngày 04/11/2026, loại chỗ Ghế ngồi mềm. Vui lòng truy cập kênh bán vé chính thức để đặt chỗ.",
            createdAt: new Date("2026-10-26T09:30:00Z"),
            readAt: new Date("2026-10-26T09:45:00Z"),
        },
    });

    await prismaClient.waitRequest.create({
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

    await prismaClient.waitRequest.create({
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

    await prismaClient.waitRequest.create({
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

    await prismaClient.waitRequest.create({
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

    await prismaClient.waitRequest.create({
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

    await prismaClient.waitRequest.create({
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

    // 6. Ghi nhật ký phân tích & AuditLog
    for (let i = 0; i < 10; i++) {
        const hour = String(7 + (i % 4)).padStart(2, "0");
        const minute = String(10 + i * 3).padStart(2, "0");
        await prismaClient.analyticsEvent.create({
            data: {
                type: "form_started",
                createdAt: new Date(`2026-10-25T${hour}:${minute}:00Z`),
            },
        });
    }

    for (let i = 0; i < 8; i++) {
        const hour = String(8 + (i % 4)).padStart(2, "0");
        const minute = String(15 + i * 4).padStart(2, "0");
        await prismaClient.analyticsEvent.create({
            data: {
                type: "request_created",
                createdAt: new Date(`2026-10-25T${hour}:${minute}:00Z`),
            },
        });
    }

    await prismaClient.auditLog.create({
        data: {
            actorId: staffUser.id,
            action: "INIT_SEED",
            entity: "SYSTEM",
            entityId: "system",
            after: JSON.stringify({ message: "Khởi tạo dữ liệu từ trips_dataset.csv thành công" }),
        },
    });

    console.log(`--- Khởi tạo toàn bộ dữ liệu thật THÀNH CÔNG (${createdTripsMap.size} chuyến)! ---`);

    return {
        tripsCount: createdTripsMap.size,
        inventoriesCount: totalInventories,
        usersCount: 7,
        requestsCount: 8,
    };
}

/**
 * Checks if the database has the real dataset.
 * If trip count <= 6 (e.g. initial mock data) or has legacy trips (A1, B2, C3),
 * it automatically runs seedRealTripsAndData().
 */
export async function ensureRealTripsSeeded(prismaClient: PrismaClient): Promise<void> {
    try {
        const count = await prismaClient.trip.count();
        const hasLegacy = await prismaClient.trip.findFirst({
            where: { code: { in: ["A1", "B2", "C3"] } },
            select: { id: true },
        });

        if (count <= 6 || hasLegacy) {
            console.log(`[AutoSeed] Phát hiện DB có ${count} chuyến hoặc chứa dữ liệu cũ. Tự động nạp 308 chuyến thật...`);
            await seedRealTripsAndData(prismaClient);
        }
    } catch (error) {
        console.warn("[AutoSeed] Không thể tự động kiểm tra/nạp dữ liệu:", error);
    }
}
