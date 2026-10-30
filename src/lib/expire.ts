import { prisma } from "@/lib/db";
import { REQUEST_STATUS } from "@/lib/constants";

const EXPIRE_REASON = "Chuyến đã khởi hành";

function todayVN() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
}

function addDays(dateStr: string, n: number) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Tự hủy các yêu cầu "Đang chờ" đã quá hạn.
 * - Truyền userId: chỉ xử lý yêu cầu của người đó (trang hành khách).
 * - Không truyền: xử lý toàn hệ thống (trang nhân viên).
 * Không gọi revalidatePath ở đây vì hàm này được gọi trong lúc render trang.
 */
export async function expireDepartedRequests(userId?: string) {
  const today = todayVN();

  const candidates = await prisma.waitRequest.findMany({
    where: {
      status: REQUEST_STATUS.PENDING,
      ...(userId ? { userId } : {}),
      trip: { departureDate: { lt: today } },
    },
    select: {
      id: true,
      code: true,
      userId: true,
      acceptDateShift: true,
      trip: { select: { departureDate: true } },
    },
  });

  const expired = candidates.filter(
    (r) => addDays(r.trip.departureDate, r.acceptDateShift ? 1 : 0) < today
  );
  if (expired.length === 0) return 0;

  const now = new Date();
  await prisma.waitRequest.updateMany({
    where: { id: { in: expired.map((r) => r.id) }, status: REQUEST_STATUS.PENDING },
    data: {
      status: REQUEST_STATUS.CANCELLED,
      cancelledAt: now,
      cancelReason: EXPIRE_REASON,
      statusChangedAt: now,
    },
  });

  try {
    await prisma.$transaction(
      expired.map((r) =>
        prisma.auditLog.create({
          data: {
            actorId: r.userId,
            action: "AUTO_EXPIRE_WAIT_REQUEST",
            entity: "WaitRequest",
            entityId: r.id,
            before: JSON.stringify({ status: REQUEST_STATUS.PENDING }),
            after: JSON.stringify({
              status: REQUEST_STATUS.CANCELLED,
              reason: EXPIRE_REASON,
              by: "SYSTEM",
            }),
          },
        })
      )
    );
  } catch (error) {
    console.error("Không ghi được AuditLog cho yêu cầu tự hết hạn:", error);
  }

  return expired.length;
}