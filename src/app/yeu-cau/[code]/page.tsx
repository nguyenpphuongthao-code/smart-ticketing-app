import React from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WaitRequestDetailView } from "@/components/waitlist/WaitRequestDetailView";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    code: string;
  };
}

export default async function YeuCauDetailPage({ params }: Props) {
  const user = await getSession();
  if (!user) {
    redirect(`/dang-nhap?redirectTo=/yeu-cau/${params.code}`);
  }

  const request = await prisma.waitRequest.findUnique({
    where: { code: params.code },
    include: {
      trip: true,
      suggestedTrip: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!request) {
    notFound();
  }

  // Security enforcement: Passengers can only see their own requests!
  if (user.role !== "STAFF" && request.userId !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <WaitRequestDetailView request={request} isStaff={user.role === "STAFF"} />
    </div>
  );
}
