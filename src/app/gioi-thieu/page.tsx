import React from "react";
import Link from "next/link";
import {
  Train,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function GioiThieuPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs mb-3">
          <Train className="w-3.5 h-3.5" />
          Đề tài môn học: Chuyển đổi số trong doanh nghiệp
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Giới thiệu dự án "Chờ vé thông minh"
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Giải pháp ghi nhận và phân tích nhu cầu di chuyển chưa được đáp ứng khi tàu kín chỗ dịp
          cao điểm, cung cấp cơ sở dữ liệu thực tiễn hỗ trợ lập kế hoạch vận hành đường sắt.
        </p>
      </div>

      {/* Bài toán thực tế */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>Bài toán thực tiễn đặt ra</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Vào các dịp lễ, Tết hay cuối tuần cao điểm, nhu cầu đi lại bằng đường sắt tăng vọt. Rất
          nhiều chuyến tàu nhanh chóng hết vé. Khi hành khách tìm vé và thấy trạng thái "Hết vé", họ
          thường rời khỏi website.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Hệ quả là: <strong>Nhu cầu chưa được đáp ứng hoàn toàn không để lại dấu vết trong dữ liệu</strong>.
          Doanh nghiệp vận tải không thể biết chính xác chuyến nào, ngày nào hay tuyến nào đang có
          bao nhiêu người thực sự muốn đi nhưng không mua được vé. Việc quyết định nối thêm toa hay
          chạy thêm tàu tăng cường do đó chủ yếu dựa trên phỏng đoán hoặc kinh nghiệm cảm tính.
        </p>
      </div>

      {/* Giải pháp đề xuất */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Ý tưởng giải pháp và cách thức hoạt động</span>
        </div>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            Hệ thống <strong>Chờ vé thông minh</strong> đóng vai trò là một kênh ghi nhận nhu cầu
            dự bị minh bạch:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
            <li>
              <strong>Đối với hành khách:</strong> Được phép đăng ký nguyện vọng chờ vé khi chuyến
              tàu mong muốn đã hết chỗ. Hành khách có thể linh hoạt chọn các điều kiện thay thế (chấp
              nhận lệch ngày ±1, chuyến khác cùng tuyến, loại chỗ khác). Khi có chỗ trống hoặc tàu
              tăng cường, hệ thống gửi thông báo giả lập để hành khách kịp thời vào đặt vé.
            </li>
            <li>
              <strong>Đối với nhân sự điều hành:</strong> Hệ thống tổng hợp dữ liệu nhu cầu chờ theo
              thời gian thực, phân tích theo từng chuyến, ngày khởi hành và tuyến đường. Bảng điều
              khiển đưa ra các <em>"Gợi ý để nhân sự xem xét"</em> (ví dụ: phát hiện chuyến A1 ngày
              04/02 có 10 vé chờ, đủ cơ sở xem xét kỹ thuật để tăng toa).
            </li>
          </ul>
        </div>
      </div>

      {/* Hard Constraints Box: BẢN DEMO KHÔNG LÀM */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-rose-900">
          <XCircle className="w-5 h-5 text-rose-600" />
          <span>Phạm vi & Giới hạn: Bản demo KHÔNG làm</span>
        </div>
        <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
          Nhằm bảo đảm tuân thủ nguyên tắc nghiên cứu học thuật và không gây nhầm lẫn cho người
          dùng, hệ thống tuân thủ nghiêm ngặt các giới hạn kỹ thuật sau:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-rose-950 font-medium pt-2">
          <div className="bg-white/80 p-3 rounded-lg border border-rose-200 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>KHÔNG kết nối hệ thống bán vé thật của bất kỳ doanh nghiệp nào</span>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-rose-200 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>KHÔNG giữ chỗ (seat holding) hoặc can thiệp kho vé thực</span>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-rose-200 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>KHÔNG thanh toán tiền hay thu bất kỳ khoản phí nào</span>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-rose-200 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>KHÔNG dùng AI dự báo suy đoán hay định giá linh hoạt</span>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-rose-200 flex items-start gap-2 sm:col-span-2">
            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>
              KHÔNG tự động quyết định thêm toa/chuyến hoặc tự động gán vé: Mọi quyết định vận hành
              đều do con người (nhân viên điều hành) xem xét và click xác nhận.
            </span>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/tim-chuyen"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition"
        >
          Trải nghiệm tìm chuyến và đăng ký chờ ngay <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
