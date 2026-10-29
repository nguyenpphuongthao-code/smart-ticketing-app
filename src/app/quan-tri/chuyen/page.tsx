import React from "react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { REQUEST_STATUS } from "@/lib/constants";
import { TripInventoryManagerView } from "@/components/waitlist/TripInventoryManagerView";

export const dynamic = "force-dynamic";

export default async function QuanTriChuyenPage() {
  await requireStaff();

  const [trips, pendingRequests] = await Promise.all([
    prisma.trip.findMany({
      include: {
        inventories: true,
      },
      orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }],
    }),
    prisma.waitRequest.findMany({
      where: { status: REQUEST_STATUS.PENDING },
      include: {
        trip: true,
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <TripInventoryManagerView trips={trips} pendingRequests={pendingRequests} />
    </div>
  );
}
