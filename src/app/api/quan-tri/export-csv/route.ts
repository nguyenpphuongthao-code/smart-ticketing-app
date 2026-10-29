import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTimeVN, formatDateVN } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden: Staff only" }, { status: 403 });
  }

  const requests = await prisma.waitRequest.findMany({
    include: {
      user: {
        select: { name: true, email: true, phone: true },
      },
      trip: true,
      suggestedTrip: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV headers and rows
  const headers = [
    "Mã yêu cầu",
    "Họ và tên khách",
    "Email",
    "Số điện thoại",
    "Mã chuyến",
    "Ga đi",
    "Ga đến",
    "Ngày đi",
    "Giờ đi",
    "Hạng chỗ",
    "Số vé",
    "Lệch ngày ±1",
    "Chuyến khác cùng tuyến",
    "Loại chỗ khác",
    "Kênh nhận",
    "Trạng thái",
    "Thông báo sai",
    "Chuyến gợi ý",
    "Hạng gợi ý",
    "Tạo lúc",
    "Thông báo lúc",
    "Chuyển đổi lúc",
    "Hủy lúc",
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = requests.map((r) => [
    escapeCsv(r.code),
    escapeCsv(r.user.name),
    escapeCsv(r.user.email),
    escapeCsv(r.user.phone || ""),
    escapeCsv(r.trip.code),
    escapeCsv(r.trip.origin),
    escapeCsv(r.trip.destination),
    escapeCsv(r.trip.departureDate),
    escapeCsv(r.trip.departureTime),
    escapeCsv(r.seatClass),
    escapeCsv(r.tickets),
    escapeCsv(r.acceptDateShift ? "Có" : "Không"),
    escapeCsv(r.acceptOtherTrip ? "Có" : "Không"),
    escapeCsv(r.acceptOtherClass ? "Có" : "Không"),
    escapeCsv(r.channel),
    escapeCsv(r.status),
    escapeCsv(r.noticeWrong ? "Có" : "Không"),
    escapeCsv(r.suggestedTrip ? `${r.suggestedTrip.code} (${r.suggestedTrip.departureDate})` : ""),
    escapeCsv(r.suggestedSeatClass || ""),
    escapeCsv(formatDateTimeVN(r.createdAt)),
    escapeCsv(formatDateTimeVN(r.notifiedAt)),
    escapeCsv(formatDateTimeVN(r.convertedAt)),
    escapeCsv(formatDateTimeVN(r.cancelledAt)),
  ]);

  // Include UTF-8 BOM (\uFEFF) so Excel on Windows properly displays Vietnamese accents!
  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="danh-sach-yeu-cau-cho-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
