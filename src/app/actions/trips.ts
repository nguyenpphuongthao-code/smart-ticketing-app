"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { REQUEST_STATUS } from "@/lib/constants";
import { updateInventorySchema, returnTicketSchema } from "@/lib/validations";

export async function updateSeatInventoryAction(inventoryId: string, formData: FormData) {
  const staff = await requireStaff();

  const capacity = parseInt(formData.get("capacity") as string, 10);
  const sold = parseInt(formData.get("sold") as string, 10);

  const parsed = updateInventorySchema.safeParse({ capacity, sold });
  if (!parsed.success) {
    return {
      success: false,
      error: "Dữ liệu không hợp lệ: " + Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
    };
  }

  const existing = await prisma.seatInventory.findUnique({
    where: { id: inventoryId },
    include: { trip: true },
  });

  if (!existing) {
    return { success: false, error: "Bản ghi tồn chỗ không tồn tại." };
  }

  const beforeJson = JSON.stringify({
    capacity: existing.capacity,
    sold: existing.sold,
  });

  const updated = await prisma.seatInventory.update({
    where: { id: inventoryId },
    data: {
      capacity: parsed.data.capacity,
      sold: parsed.data.sold,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: staff.id,
      action: "UPDATE_INVENTORY",
      entity: "SeatInventory",
      entityId: inventoryId,
      before: beforeJson,
      after: JSON.stringify({
        trip: existing.trip.code,
        seatClass: existing.seatClass,
        capacity: parsed.data.capacity,
        sold: parsed.data.sold,
      }),
    },
  });

  revalidatePath("/quan-tri/chuyen");
  revalidatePath("/tim-chuyen");
  revalidatePath(`/chuyen/${existing.tripId}`);

  return { success: true };
}

export async function recordTicketReturnAction(formData: FormData) {
  const staff = await requireStaff();

  const tripId = formData.get("tripId") as string;
  const seatClass = formData.get("seatClass") as any;
  const quantity = parseInt(formData.get("quantity") as string, 10);

  const parsed = returnTicketSchema.safeParse({ tripId, seatClass, quantity });
  if (!parsed.success) {
    return {
      success: false,
      error: "Dữ liệu vé trả không hợp lệ.",
    };
  }

  const inventory = await prisma.seatInventory.findUnique({
    where: {
      tripId_seatClass: {
        tripId,
        seatClass,
      },
    },
    include: { trip: true },
  });

  if (!inventory) {
    return { success: false, error: "Hạng chỗ không tồn tại trên chuyến này." };
  }

  const newSold = Math.max(0, inventory.sold - quantity);

  await prisma.seatInventory.update({
    where: { id: inventory.id },
    data: { sold: newSold },
  });

  // Write AuditLog
  await prisma.auditLog.create({
    data: {
      actorId: staff.id,
      action: "RECORD_TICKET_RETURN",
      entity: "SeatInventory",
      entityId: inventory.id,
      before: JSON.stringify({ sold: inventory.sold }),
      after: JSON.stringify({
        trip: inventory.trip.code,
        seatClass,
        returnedQuantity: quantity,
        newSold,
      }),
    },
  });

  revalidatePath("/quan-tri/chuyen");
  revalidatePath("/tim-chuyen");
  revalidatePath(`/chuyen/${tripId}`);

  return {
    success: true,
    tripId,
    seatClass,
    quantity,
    message: `Đã ghi nhận ${quantity} vé trả cho hạng ${seatClass} (Tàu ${inventory.trip.code}).`,
  };
}

export async function confirmMatchingSuggestionAction(
  requestCode: string,
  suggestedTripId: string,
  suggestedSeatClass: string
) {
  const staff = await requireStaff();

  const request = await prisma.waitRequest.findUnique({
    where: { code: requestCode },
    include: { trip: true, user: true },
  });

  if (!request) {
    return { success: false, error: "Yêu cầu không tồn tại." };
  }

  const suggestedTrip = await prisma.trip.findUnique({
    where: { id: suggestedTripId },
  });

  const tripCode = suggestedTrip?.code || request.trip.code;
  const departureDate = suggestedTrip?.departureDate || request.trip.departureDate;

  // Update status to "Có vé phù hợp"
  await prisma.waitRequest.update({
    where: { code: requestCode },
    data: {
      status: REQUEST_STATUS.MATCHED,
      suggestedTripId,
      suggestedSeatClass,
      notifiedAt: new Date(),
      statusChangedAt: new Date(),
      staffNote: `Được ghép chỗ từ vé trả chuyến ${tripCode} ngày ${departureDate}.`,
    },
  });

  // Create simulated notification
  await prisma.notification.create({
    data: {
      userId: request.userId,
      requestId: request.id,
      channel: request.channel,
      simulated: true,
      message: `Đã có vé phù hợp cho yêu cầu ${request.code}: Chuyến ${tripCode} ngày ${departureDate}, loại chỗ ${suggestedSeatClass}. Vui lòng kiểm tra và đặt vé sớm trên kênh chính thức.`,
    },
  });

  // Write AuditLog
  await prisma.auditLog.create({
    data: {
      actorId: staff.id,
      action: "CONFIRM_MATCHING_SUGGESTION",
      entity: "WaitRequest",
      entityId: request.id,
      after: JSON.stringify({
        status: REQUEST_STATUS.MATCHED,
        suggestedTrip: tripCode,
        suggestedSeatClass,
      }),
    },
  });

  revalidatePath("/quan-tri/chuyen");
  revalidatePath("/quan-tri/yeu-cau");
  revalidatePath("/quan-tri");
  revalidatePath("/quan-tri/phan-tich");
  revalidatePath("/quan-tri/kpi");

  return { success: true };
}
