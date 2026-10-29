import type { Metadata } from "next";
import "./globals.css";
import { SimulationBanner } from "@/components/layout/SimulationBanner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Chờ vé thông minh - Giải pháp ghi nhận nhu cầu tàu hết vé",
  description:
    "Hệ thống minh họa cho đề tài môn Chuyển đổi số trong doanh nghiệp: Ghi nhận và phân tích nhu cầu chưa được đáp ứng khi tàu hết vé cao điểm.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  let unreadCount = 0;
  if (user) {
    try {
      unreadCount = await prisma.notification.count({
        where: {
          userId: user.id,
          readAt: null,
        },
      });
    } catch {
      unreadCount = 0;
    }
  }

  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <SimulationBanner />
        <Navbar user={user} unreadCount={unreadCount} />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
