import React from "react";
import Link from "next/link";
import {
  Train,
  HelpCircle,
  Lightbulb,
  XCircle,
  ArrowRight,
  Cpu,
  BarChart3,
} from "lucide-react";

export default function GioiThieuPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Hero Header */}
      <div className="space-y-3 border-b border-slate-200 pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
          <Train className="w-3.5 h-3.5" />
          Đề tài môn học: Chuyển đổi số trong doanh nghiệp vận tải
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hệ thống "Chờ vé thông minh" (Smart Ticketing Waitlist)
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          Nền tảng thu nhận và phân tích nhu cầu di chuyển chưa được đáp ứng khi tàu kín chỗ dịp
          cao điểm, cung cấp cơ sở dữ liệu thực nghiệm phục vụ tối ưu hóa điều phối tải trọng và
          lập kế hoạch tăng toa cho ngành đường sắt.
        </p>
      </div>

      {/* 1. Thực trạng & Nỗi đau ngành vận tải */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-rose-600" />
          <span>1. Thực trạng & Nỗi đau trong vận hành cao điểm</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
          <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Về phía hành khách
            </h4>
            <p>
              Vào các đợt cao điểm Lễ, Tết hoặc mùa hè, vé tàu hỏa các tuyến trọng điểm (Hà Nội ↔
              Sài Gòn, Đà Nẵng, Nha Trang...) thường cháy vé rất sớm. Khi thấy biển báo "Hết vé",
              hành khách phải liên tục F5 trang web nhiều lần trong ngày với hy vọng ai đó trả vé,
              hoặc phải chuyển sang các phương tiện khác với chi phí đắt đỏ hơn.
            </p>
          </div>
          <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Về phía đơn vị vận tải
            </h4>
            <p>
              Khi hành khách thấy hết vé và đóng website, toàn bộ nhu cầu tiềm năng biến mất không
              để lại dữ liệu. Bộ phận điều hành hoàn toàn "mù thông tin" về lượng khách thực sự muốn
              đi. Việc quyết định nối thêm toa xe hay lập đoàn tàu tăng cường phần lớn dựa vào cảm
              tính hoặc thống kê bán vé lịch sử, dẫn đến nguy cơ thừa/thiếu tải trọng.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Mục tiêu chuyển đổi số */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>2. Mục tiêu chuyển đổi số và Nguyên tắc cốt lõi</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Thu thập dữ liệu nhu cầu thực</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Biến các lượt truy cập không mua được vé thành bản ghi nhu cầu có cấu trúc: chặng đi,
              ngày khởi hành, hạng ghế và mức độ chấp nhận linh hoạt.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Khớp chỗ & Tái phân phối vé trả</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tự động gợi ý ghép chỗ khi có hành khách trả vé hoặc mở thêm toa mới theo 4 cấp độ ưu
              tiên rõ ràng, minh bạch và không thiên vị.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Hỗ trợ ra quyết định tăng toa</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cung cấp biểu đồ nhiệt nhu cầu, phát hiện các điểm nghẽn và đưa ra khuyến nghị kỹ thuật
              để nhân viên điều hành cân nhắc nối toa hoặc chạy thêm mác tàu.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Quy trình vận hành & Thuật toán ghép chỗ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          <Cpu className="w-5 h-5 text-indigo-600" />
          <span>3. Quy trình vận hành & Cơ chế ghép chỗ 4 cấp độ</span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            Khi kho vé phát sinh chỗ trống (do có khách hủy vé, trả vé hoặc đơn vị bổ sung sức
            chứa), thuật toán ghép chỗ sẽ quét hàng đợi và phân loại mức độ phù hợp:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                  Cấp 1 - Ưu tiên cao nhất
                </span>
                <span>Khớp chính xác 100% (Exact Match)</span>
              </div>
              <p className="text-xs text-slate-600">
                Đúng chuyến tàu, đúng ngày khởi hành, đúng hạng ghế mong muốn và số lượng vé phù hợp.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">
                  Cấp 2 - Linh hoạt ngày
                </span>
                <span>Chấp nhận lệch ngày (±1 ngày)</span>
              </div>
              <p className="text-xs text-slate-600">
                Hành khách có tích chọn "Chấp nhận đi lệch ±1 ngày", cùng mác tàu hoặc tuyến đường.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">
                  Cấp 3 - Linh hoạt chuyến
                </span>
                <span>Chuyến khác cùng tuyến & ngày</span>
              </div>
              <p className="text-xs text-slate-600">
                Hành khách chọn "Chấp nhận chuyến khác cùng tuyến trong ngày" có giờ chạy gần nhất.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px]">
                  Cấp 4 - Linh hoạt hạng ghế
                </span>
                <span>Chấp nhận đổi loại chỗ</span>
              </div>
              <p className="text-xs text-slate-600">
                Hành khách tích chọn "Chấp nhận hạng ghế khác" (ví dụ: chuyển từ Giường nằm sang Ghế
                ngồi mềm).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bộ 6 chỉ số đo lường hiệu quả (KPIs) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <span>4. Bộ chỉ số đo lường hiệu quả (KPI Framework)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Hệ thống xây dựng 6 chỉ số định lượng cụ thể để bộ phận quản trị đánh giá mức độ thành
          công của chuyển đổi số và chất lượng điều hành:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900">KPI 1: Tỷ lệ chuyến quá tải</span>
            <p className="text-slate-500">
              Phần trăm số chuyến có tồn chỗ bằng 0 và có danh sách chờ tích lũy trên tổng số chuyến.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900">KPI 2: Tỷ lệ đáp ứng nhu cầu chờ</span>
            <p className="text-slate-500">
              Số yêu cầu chờ được khớp chỗ thành công / tổng số yêu cầu chờ đăng ký trong kỳ.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900">KPI 3: Thời gian phản hồi trung bình</span>
            <p className="text-slate-500">
              Thời gian từ lúc phát sinh vé trả/tăng toa đến khi phát thông báo mời đặt vé.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900">KPI 4: Tỷ lệ chấp nhận phương án thay thế</span>
            <p className="text-slate-500">
              Đo lường mức độ sẵn sàng đi lệch ngày hoặc đổi chuyến của hành khách khi được gợi ý.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900">KPI 5: Hệ số lấp đầy chỗ tăng cường</span>
            <p className="text-slate-500">
              Tỷ lệ chỗ bán được trên các toa nối thêm hoặc chuyến tăng cường được kích hoạt.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900">KPI 6: Mức độ minh bạch & hài lòng</span>
            <p className="text-slate-500">
              Tỷ lệ hài lòng của khách khi được cập nhật số thứ tự chờ và tiến độ rõ ràng.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Hard Constraints Box: BẢN DEMO KHÔNG LÀM */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-lg font-bold text-rose-900 border-b border-rose-200/80 pb-3">
          <XCircle className="w-5 h-5 text-rose-600" />
          <span>5. Phạm vi nghiên cứu & Giới hạn kỹ thuật ("Bản demo KHÔNG làm")</span>
        </div>
        <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
          Nhằm bảo đảm tính khách quan trong nghiên cứu học thuật, hệ thống tuân thủ nghiêm ngặt các
          giới hạn kỹ thuật và pháp lý sau:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-rose-950 font-medium pt-1">
          <div className="bg-white/90 p-3 rounded-lg border border-rose-200 flex items-start gap-2 shadow-xs">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>KHÔNG kết nối API hệ thống bán vé thương mại thật của bất kỳ đơn vị nào.</span>
          </div>
          <div className="bg-white/90 p-3 rounded-lg border border-rose-200 flex items-start gap-2 shadow-xs">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>KHÔNG giữ chỗ (seat holding) hoặc can thiệp giữ chỗ trước của hành khách.</span>
          </div>
          <div className="bg-white/90 p-3 rounded-lg border border-rose-200 flex items-start gap-2 shadow-xs">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>KHÔNG thu tiền, cọc giữ chỗ hay bất kỳ khoản phí dịch vụ tài chính nào.</span>
          </div>
          <div className="bg-white/90 p-3 rounded-lg border border-rose-200 flex items-start gap-2 shadow-xs">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>KHÔNG áp dụng thuật toán định giá linh hoạt động (dynamic surge pricing).</span>
          </div>
          <div className="bg-white/90 p-3 rounded-lg border border-rose-200 flex items-start gap-2 sm:col-span-2 shadow-xs">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>
              KHÔNG tự động gán vé hoặc tự động nối toa: Mọi đề xuất điều hành đều có vai trò con
              người (nhân viên điều hành) kiểm tra, xác nhận và chịu trách nhiệm.
            </span>
          </div>
        </div>
      </div>

      {/* Navigation CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/tim-chuyen"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition"
        >
          Trải nghiệm tìm chuyến & đăng ký chờ <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/quan-tri"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition"
        >
          Đến trung tâm điều hành quản trị <BarChart3 className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
