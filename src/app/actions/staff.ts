"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { REQUEST_STATUS } from "@/lib/constants";
import { updateRequestStatusSchema } from "@/lib/validations";

export async function staffUpdateWaitRequestStatusAction(formData: FormData) {
  const staff = await requireStaff();

  const code = formData.get("code") as string;
  const status = formData.get("status") as string;
  const suggestedTripId = (formData.get("suggestedTripId") as string) || undefined;
  const suggestedSeatClass = (formData.get("suggestedSeatClass") as string) || undefined;
  const staffNote = (formData.get("staffNote") as string) || undefined;
  const noticeWrong = formData.get("noticeWrong") === "true";

  const request = await prisma.waitRequest.findUnique({
    where: { code },
    include: {
      trip: true,
      user: true,
    },
  });

  if (!request) {
    return { success: false, error: "Yêu cầu không tồn tại." };
  }

  // Allowed transitions:
  // "Đang chờ" -> "Có vé phù hợp" OR "Đã hủy"
  // "Có vé phù hợp" -> "Đã hủy"
  if (request.status === REQUEST_STATUS.CANCELLED) {
    return {
      success: false,
      error: "Yêu cầu đã hủy không thể thay đổi trạng thái.",
    };
  }

  if (request.status === REQUEST_STATUS.MATCHED && status !== REQUEST_STATUS.CANCELLED) {
    return {
      success: false,
      error: "Yêu cầu 'Có vé phù hợp' chỉ có thể chuyển sang 'Đã hủy'.",
    };
  }

  const beforeJson = JSON.stringify({
    status: request.status,
    suggestedTripId: request.suggestedTripId,
    suggestedSeatClass: request.suggestedSeatClass,
    staffNote: request.staffNote,
    noticeWrong: request.noticeWrong,
  });

  const updateData: any = {
    status,
    statusChangedAt: new Date(),
    noticeWrong,
  };

  if (staffNote !== undefined) {
    updateData.staffNote = staffNote;
  }

  if (status === REQUEST_STATUS.MATCHED) {
    updateData.suggestedTripId = suggestedTripId || request.tripId;
    updateData.suggestedSeatClass = suggestedSeatClass || request.seatClass;
    updateData.notifiedAt = new Date();

    // Fetch suggested trip details for notification message
    const targetTrip = await prisma.trip.findUnique({
      where: { id: updateData.suggestedTripId },
    });

    const tripCodeStr = targetTrip?.code || request.trip.code;
    const dateStr = targetTrip?.departureDate || request.trip.departureDate;
    const seatClassStr = updateData.suggestedSeatClass;

    // Create Notification for the passenger (simulated per user channel)
    await prisma.notification.create({
      data: {
        userId: request.userId,
        requestId: request.id,
        channel: request.channel,
        simulated: true,
        message: `Đã có vé phù hợp cho yêu cầu ${request.code}: Chuyến ${tripCodeStr} ngày ${dateStr}, loại chỗ ${seatClassStr}. Vui lòng đăng nhập để kiểm tra.`,
      },
    });
  } else if (status === REQUEST_STATUS.CANCELLED) {
    updateData.cancelledAt = new Date();
    updateData.cancelReason = staffNote || "Nhân viên điều hành hủy yêu cầu";
  }

  const updated = await prisma.waitRequest.update({
    where: { code },
    data: updateData,
  });

  // Write AuditLog
  await prisma.auditLog.create({
    data: {
      actorId: staff.id,
      action: "STAFF_UPDATE_STATUS",
      entity: "WaitRequest",
      entityId: request.id,
      before: beforeJson,
      after: JSON.stringify(updateData),
    },
  });

  revalidatePath(`/quan-tri/yeu-cau/${code}`);
  revalidatePath("/quan-tri/yeu-cau");
  revalidatePath("/quan-tri");
  revalidatePath("/quan-tri/phan-tich");
  revalidatePath("/quan-tri/kpi");
  revalidatePath(`/yeu-cau/${code}`);
  revalidatePath("/yeu-cau");
  revalidatePath("/thong-bao");

  return { success: true };
}
