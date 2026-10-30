"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, clearSessionCookie } from "@/lib/auth";
import { REQUEST_STATUS } from "@/lib/constants";
import { expireDepartedRequests } from "@/lib/expire";
import {
  createWaitRequestSchema,
  cancelRequestSchema,
  updateProfileSchema,
  changePasswordSchema,
  rateCsatSchema,
} from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function logFormStartedAction() {
  try {
    const user = await requireUser();
    await prisma.analyticsEvent.create({
      data: {
        type: "form_started",
        userId: user.id,
      },
    });
  } catch {
    // If not logged in or error, still log anonymously
    await prisma.analyticsEvent.create({
      data: {
        type: "form_started",
      },
    });
  }
}

export async function createWaitRequestAction(formData: FormData) {
  const user = await requireUser();

  await expireDepartedRequests(user.id);

  const tripId = formData.get("tripId") as string;
  const seatClass = formData.get("seatClass") as string;
  const tickets = parseInt(formData.get("tickets") as string, 10);
  const acceptDateShift = formData.get("acceptDateShift") === "true";
  const acceptOtherTrip = formData.get("acceptOtherTrip") === "true";
  const acceptOtherClass = formData.get("acceptOtherClass") === "true";
  const channel = (formData.get("channel") as "WEBSITE" | "SMS" | "EMAIL") || user.defaultChannel;

  const parsed = createWaitRequestSchema.safeParse({
    tripId,
    seatClass,
    tickets,
    acceptDateShift,
    acceptOtherTrip,
    acceptOtherClass,
    channel,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Dữ liệu đăng ký không hợp lệ: " + Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  // 1. Fetch trip and check if in the future
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { inventories: true },
  });

  if (!trip) {
    return { success: false, error: "Chuyến tàu không tồn tại." };
  }

  // 2. Check seat availability
  const inventory = trip.inventories.find((inv) => inv.seatClass === seatClass);
  if (!inventory) {
    return { success: false, error: "Hạng chỗ không tồn tại trên chuyến tàu này." };
  }

  const availableSeats = inventory.capacity - inventory.sold;
  if (availableSeats >= tickets) {
    return {
      success: false,
      error: "Chuyến này còn vé, bạn có thể đặt vé trên kênh bán vé chính thức.",
    };
  }

  // 3. User limit rules:
  // - Max 5 active requests per user
  // - 1 active request per user per trip + class
  const activeUserRequests = await prisma.waitRequest.findMany({
    where: {
      userId: user.id,
      OR: [
        { status: REQUEST_STATUS.PENDING },
        { status: REQUEST_STATUS.MATCHED, convertedAt: null },
      ],
    },
  });

  if (activeUserRequests.length >= 5) {
    return {
      success: false,
      error: "Bạn đã đạt giới hạn tối đa 5 yêu cầu chờ đang hoạt động.",
    };
  }

  const existingSameTripAndClass = activeUserRequests.some(
    (r) => r.tripId === tripId && r.seatClass === seatClass
  );
  if (existingSameTripAndClass) {
    return {
      success: false,
      error: "Bạn đã có một yêu cầu chờ cho chuyến tàu và hạng chỗ này.",
    };
  }

  // 4. Generate next code: YC-001, YC-002, etc.
  const allRequests = await prisma.waitRequest.findMany({
    select: { code: true },
  });

  let maxNum = 0;
  for (const r of allRequests) {
    const match = r.code.match(/YC-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const nextCode = `YC-${String(maxNum + 1).padStart(3, "0")}`;

  // 5. Create request
  const newRequest = await prisma.waitRequest.create({
    data: {
      code: nextCode,
      userId: user.id,
      tripId,
      seatClass,
      tickets,
      acceptDateShift,
      acceptOtherTrip,
      acceptOtherClass,
      channel,
      status: REQUEST_STATUS.PENDING,
    },
  });

  // 6. Log Analytics event: request_created
  await prisma.analyticsEvent.create({
    data: {
      type: "request_created",
      userId: user.id,
    },
  });

  // 7. Write AuditLog
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "CREATE_WAIT_REQUEST",
      entity: "WaitRequest",
      entityId: newRequest.id,
      after: JSON.stringify({
        code: nextCode,
        trip: trip.code,
        seatClass,
        tickets,
        channel,
      }),
    },
  });

  revalidatePath("/yeu-cau");
  revalidatePath("/quan-tri");
  revalidatePath("/quan-tri/yeu-cau");
  revalidatePath("/quan-tri/phan-tich");
  revalidatePath("/quan-tri/kpi");

  return {
    success: true,
    code: nextCode,
  };
}

export async function cancelWaitRequestAction(code: string, reason?: string) {
  const user = await requireUser();

  const request = await prisma.waitRequest.findUnique({
    where: { code },
  });

  if (!request) {
    return { success: false, error: "Yêu cầu không tồn tại." };
  }

  // Enforce passenger ownership
  if (user.role !== "STAFF" && request.userId !== user.id) {
    return { success: false, error: "Bạn không có quyền thao tác trên yêu cầu này." };
  }

  // Passengers can only cancel "Đang chờ" or "Có vé phù hợp"
  if (request.status !== REQUEST_STATUS.PENDING && request.status !== REQUEST_STATUS.MATCHED) {
    return {
      success: false,
      error: "Yêu cầu ở trạng thái hiện tại không thể hủy.",
    };
  }

  const beforeJson = JSON.stringify({
    status: request.status,
    cancelledAt: request.cancelledAt,
  });

  await prisma.waitRequest.update({
    where: { code },
    data: {
      status: REQUEST_STATUS.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: reason || "Hành khách chủ động hủy yêu cầu",
      statusChangedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "CANCEL_WAIT_REQUEST",
      entity: "WaitRequest",
      entityId: request.id,
      before: beforeJson,
      after: JSON.stringify({
        status: REQUEST_STATUS.CANCELLED,
        reason: reason || "Hành khách chủ động hủy yêu cầu",
      }),
    },
  });

  revalidatePath(`/yeu-cau/${code}`);
  revalidatePath("/yeu-cau");
  revalidatePath("/quan-tri");
  revalidatePath("/quan-tri/yeu-cau");
  revalidatePath("/quan-tri/phan-tich");
  revalidatePath("/quan-tri/kpi");

  return { success: true };
}

export async function confirmConvertedAction(code: string) {
  const user = await requireUser();

  const request = await prisma.waitRequest.findUnique({
    where: { code },
  });

  if (!request) {
    return { success: false, error: "Yêu cầu không tồn tại." };
  }

  if (request.userId !== user.id && user.role !== "STAFF") {
    return { success: false, error: "Không có quyền thực hiện." };
  }

  await prisma.waitRequest.update({
    where: { code },
    data: {
      convertedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "CONFIRM_CONVERTED",
      entity: "WaitRequest",
      entityId: request.id,
      after: JSON.stringify({ convertedAt: new Date() }),
    },
  });

  revalidatePath(`/yeu-cau/${code}`);
  revalidatePath("/quan-tri/kpi");

  return { success: true };
}

export async function rateCsatAction(code: string, csat: number) {
  const user = await requireUser();

  const parsed = rateCsatSchema.safeParse({ csat });
  if (!parsed.success) {
    return { success: false, error: "Điểm đánh giá phải từ 1 đến 5 sao." };
  }

  const request = await prisma.waitRequest.findUnique({
    where: { code },
  });

  if (!request || request.userId !== user.id) {
    return { success: false, error: "Không tìm thấy yêu cầu hợp lệ." };
  }

  await prisma.waitRequest.update({
    where: { code },
    data: { csat },
  });

  revalidatePath(`/yeu-cau/${code}`);
  revalidatePath("/quan-tri/kpi");

  return { success: true };
}

export async function markNotificationReadAction(notificationId: string) {
  const user = await requireUser();

  const notif = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notif || notif.userId !== user.id) {
    return { success: false, error: "Thông báo không tồn tại." };
  }

  if (!notif.readAt) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  revalidatePath("/thong-bao");
  revalidatePath("/quan-tri/kpi");

  return { success: true };
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();

  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string) || undefined;
  const defaultChannel = formData.get("defaultChannel") as "WEBSITE" | "SMS" | "EMAIL";

  const parsed = updateProfileSchema.safeParse({ name, phone, defaultChannel });
  if (!parsed.success) {
    return {
      success: false,
      error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name.trim(),
      phone: parsed.data.phone?.trim() || null,
      defaultChannel: parsed.data.defaultChannel,
    },
  });

  revalidatePath("/ho-so");
  return { success: true };
}

export async function changePasswordAction(formData: FormData) {
  const user = await requireUser();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const parsed = changePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return { success: false, error: "Người dùng không tồn tại." };
  }

  const isMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Mật khẩu hiện tại không chính xác." };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { success: true };
}

export async function deleteAccountAction() {
  const user = await requireUser();

  // Cascade delete is configured in schema on WaitRequest & Notification
  await prisma.user.delete({
    where: { id: user.id },
  });

  await clearSessionCookie();
  return { success: true };
}
