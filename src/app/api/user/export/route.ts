import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      waitRequests: {
        include: {
          trip: true,
          suggestedTrip: true,
        },
      },
      notifications: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Remove passwordHash for privacy
  const { passwordHash, ...safeUserData } = user;

  const dataString = JSON.stringify(safeUserData, null, 2);

  return new NextResponse(dataString, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="du-lieu-ca-nhan-${user.id}.json"`,
    },
  });
}
