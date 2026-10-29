import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { StaffRequestActionView } from "@/components/waitlist/StaffRequestActionView";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    code: string;
  };
}

export default async function QuanTriChiTietYeuCauPage({ params }: Props) {
  await requireStaff();

  const [request, allTrips] = await Promise.all([
    prisma.waitRequest.findUnique({
      where: { code: params.code },
      include: {
        trip: true,
        suggestedTrip: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    }),
    prisma.trip.findMany({
      select: {
        id: true,
        code: true,
        origin: true,
        destination: true,
        departureDate: true,
        departureTime: true,
      },
      orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }],
    }),
  ]);

  if (!request) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-2">
      <StaffRequestActionView request={request} allTrips={allTrips} />
    </div>
  );
}
