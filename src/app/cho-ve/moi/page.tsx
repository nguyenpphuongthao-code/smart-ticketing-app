import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CreateWaitRequestForm } from "@/components/waitlist/CreateWaitRequestForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    tripId?: string;
    seatClass?: string;
  };
}

export default async function ChoVeMoiPage({ searchParams }: Props) {
  const user = await getSession();
  if (!user) {
    const redirectUrl = `/dang-nhap?redirectTo=${encodeURIComponent(
      searchParams.tripId
        ? `/cho-ve/moi?tripId=${searchParams.tripId}&seatClass=${searchParams.seatClass || ""}`
        : "/cho-ve/moi"
    )}`;
    redirect(redirectUrl);
  }

  // Chỉ lấy các chuyến tàu chưa khởi hành
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const trips = await prisma.trip.findMany({
    where: {
      departureDate: {
        gte: today,
      },
    },
    include: {
      inventories: true,
    },
    orderBy: [{ departureDate: "asc" }, { departureTime: "asc" }],
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Đăng ký chờ vé
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ghi nhận nhu cầu của bạn khi chuyến tàu đã hết chỗ. Hệ thống sẽ thông báo ngay khi có vé
          phù hợp.
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-600">
          Hiện chưa có chuyến tàu nào sắp khởi hành để đăng ký chờ.
        </div>
      ) : (
        <CreateWaitRequestForm
          user={user}
          trips={trips}
          initialTripId={searchParams.tripId}
          initialSeatClass={searchParams.seatClass}
        />
      )}
    </div>
  );
}
