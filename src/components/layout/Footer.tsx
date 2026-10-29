import React from "react";
import Link from "next/link";
import { Train, Info, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Train className="w-5 h-5 text-blue-400" />
              <span>Chờ vé thông minh (Smart Ticket Waitlist)</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Dự án môn học: <strong>Chuyển đổi số trong doanh nghiệp</strong> (Digital
              Transformation in Business). Giải pháp ghi nhận nhu cầu chưa được đáp ứng
              khi tàu hết vé trong các dịp cao điểm, hỗ trợ nhân sự đường sắt lập kế hoạch
              vận hành thực tế.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/50">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Toàn bộ dữ liệu trong hệ thống là dữ liệu giả lập minh họa.</span>
            </div>
          </div>

          {/* Col 2: Liên kết nhanh */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Liên kết chính
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-blue-400">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/tim-chuyen" className="hover:text-blue-400">
                  Tìm chuyến & Tồn chỗ
                </Link>
              </li>
              <li>
                <Link href="/cho-ve/moi" className="hover:text-blue-400">
                  Đăng ký chờ vé
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="hover:text-blue-400">
                  Giới thiệu & Phạm vi đề tài
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quy tắc cốt lõi */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Cam kết thiết kế
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Không can thiệp hệ thống bán vé thật</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Không giữ chỗ hay thanh toán tiền</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Nhân viên điều hành kiểm soát quyết định</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Nhóm sinh viên thực hiện đề tài Chuyển đổi số. Thiết kế độc lập.</p>
          <p className="text-[11px]">
            Hệ thống minh họa học thuật – Không đại diện cho bất kỳ doanh nghiệp vận tải nào.
          </p>
        </div>
      </div>
    </footer>
  );
}
