import React from "react";
import Link from "next/link";
import {
  Train,
  Search,
  Bell,
  Clock,
  CheckCircle,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  MapPin,
} from "lucide-react";
import { STATIONS } from "@/lib/stations";


export default async function HomePage() {

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>Môn học: Chuyển đổi số trong doanh nghiệp (Digital Transformation)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Ghi nhận nhu cầu khi tàu hết vé. <br className="hidden sm:inline" />
            <span className="text-blue-300">Hỗ trợ vận hành, minh bạch dữ liệu.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Khi vé tàu dịp cao điểm đã bán hết, nhu cầu thực sự của hành khách thường biến mất
            khỏi hệ thống dữ liệu. <strong>Chờ vé thông minh</strong> ghi nhận nhu cầu chưa được
            đáp ứng, giúp hành khách nhận thông báo khi có chỗ trống và giúp nhân sự điều hành có
            cơ sở dữ liệu thực để lập kế hoạch.
          </p>

          {/* Search Box on Hero */}
          <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-4 sm:p-6 max-w-4xl mx-auto mt-8 border border-slate-100 text-left">
            <form action="/tim-chuyen" method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Ga đi
                </label>
                <select
                  name="origin"
                  defaultValue="Hà Nội"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {STATIONS.map((st) => (
                    <option key={`orig-${st.name}`} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Ga đến
                </label>
                <select
                  name="destination"
                  defaultValue="Đà Nẵng"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {STATIONS.map((st) => (
                    <option key={`dest-${st.name}`} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Ngày đi
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue="2026-11-04"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <Search className="w-4 h-4" />
                  Tìm chuyến tàu & Kiểm tra tồn chỗ
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Section: Cách hoạt động (3 bước) */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Quy trình đơn giản
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              Cách hệ thống hoạt động
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Hành khách đăng ký nhu cầu khi chuyến tàu hết chỗ, hệ thống giúp kết nối nhu cầu đó
              với nhân viên điều hành.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bước 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Đăng ký chờ</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Khi chuyến tàu bạn muốn đi đã hết vé, hãy gửi yêu cầu chờ với các tùy chọn linh
                hoạt: lệch ngày ±1, chuyến khác cùng tuyến, hoặc loại chỗ khác.
              </p>
            </div>

            {/* Bước 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Theo dõi trạng thái</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Yêu cầu của bạn được hiển thị rõ ràng với 3 trạng thái minh bạch:{" "}
                <span className="font-semibold text-amber-700">Đang chờ</span>,{" "}
                <span className="font-semibold text-emerald-700">Có vé phù hợp</span>, hoặc{" "}
                <span className="font-semibold text-slate-600">Đã hủy</span>.
              </p>
            </div>

            {/* Bước 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Nhận thông báo</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Khi có vé trả hoặc nhân viên sắp xếp được chỗ trống, bạn nhận thông báo giả lập qua
                Website, SMS hoặc Email để chủ động lên kênh chính thức đặt vé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two columns: Dành cho hành khách / Dành cho nhân sự điều hành */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột 1: Dành cho hành khách */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dành cho hành khách</h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Không cần phải liên tục canh F5 màn hình mua vé khi chuyến đã hết chỗ.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Chủ động chọn mức độ linh hoạt (chấp nhận đổi ngày ±1, chuyến khác, loại chỗ
                    khác).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Nhận thông báo tức thời khi có cơ hội mua vé và đánh giá mức độ hài lòng.
                  </span>
                </li>
              </ul>
              <Link
                href="/cho-ve/moi"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Đăng ký chờ vé ngay <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Cột 2: Dành cho nhân sự điều hành */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Dành cho nhân sự điều hành
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Biến "nhu cầu vô hình" thành dữ liệu thống kê cụ thể theo từng chuyến, ngày và
                    tuyến.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Nhận <strong>gợi ý để nhân sự xem xét</strong> nối thêm toa hoặc lập tàu tăng
                    cường có cơ sở.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Quy trình ghép chỗ khi phát sinh vé trả minh bạch, ưu tiên đúng chuyến và công
                    bằng.
                  </span>
                </li>
              </ul>
              <Link
                href="/quan-tri"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Xem trung tâm quản trị <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Phạm vi và giới hạn của bản demo */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-300 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Phạm vi và giới hạn của bản demo
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Đây là sản phẩm học thuật phục vụ môn học{" "}
              <strong>Chuyển đổi số trong doanh nghiệp</strong>. Để bảo đảm tính minh bạch và tuân
              thủ pháp lý, hệ thống được thiết kế với các ranh giới rõ ràng:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <strong>KHÔNG kết nối hệ thống thật:</strong> Toàn bộ chuyến tàu, số ghế và người
                dùng là giả lập.
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <strong>KHÔNG giữ chỗ & thanh toán:</strong> Hệ thống không thu tiền và không giữ vé
                thay hành khách.
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <strong>KHÔNG tự động quyết định:</strong> Mọi thao tác ghép chỗ hay tăng chuyến đều
                do nhân sự duyệt thủ công.
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <strong>KHÔNG áp dụng AI suy diễn:</strong> Dữ liệu chỉ dùng các phép tính thống kê
                thực tế và quy tắc rõ ràng.
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 text-right">
              <Link
                href="/gioi-thieu"
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Tìm hiểu thêm về phạm vi đề tài <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
