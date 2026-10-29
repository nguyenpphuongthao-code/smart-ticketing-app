export interface KpiMetric {
  id: string;
  name: string;
  definition: string;
  formula: string;
  measurementMethod: string;
  currentValue: string;
  rawValue: number | null;
  decisionThreshold: string;
}

export interface KpiRawData {
  formStartedCount: number;
  requestCreatedCount: number;
  matchedRequestsCount: number;
  convertedRequestsCount: number;
  notifiedCount: number;
  noticeWrongCount: number;
  readDurationMinutesList: number[];
  csatRatings: number[];
  waitingByTripRouteDate: Array<{
    route: string;
    date: string;
    tripCode: string;
    waitingRequestsCount: number;
    waitingTicketsCount: number;
  }>;
}

/**
 * Pure functions to compute KPI metrics
 */
export function calculateCompletionRate(requestCreated: number, formStarted: number): number {
  if (formStarted <= 0) return 0;
  return Math.min(100, Math.round((requestCreated / formStarted) * 1000) / 10);
}

export function calculateConversionRate(convertedCount: number, matchedCount: number): number {
  if (matchedCount <= 0) return 0;
  return Math.min(100, Math.round((convertedCount / matchedCount) * 1000) / 10);
}

export function calculateAverageReadTimeMinutes(durations: number[]): number {
  if (durations.length === 0) return 0;
  const sum = durations.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / durations.length) * 10) / 10;
}

export function calculateWrongNoticeRate(wrongCount: number, notifiedCount: number): number {
  if (notifiedCount <= 0) return 0;
  return Math.min(100, Math.round((wrongCount / notifiedCount) * 1000) / 10);
}

export function calculateAverageCsat(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export function buildKpiMetricsList(data: KpiRawData): KpiMetric[] {
  const completionRate = calculateCompletionRate(data.requestCreatedCount, data.formStartedCount);
  const conversionRate = calculateConversionRate(data.convertedRequestsCount, data.matchedRequestsCount);
  const avgReadMinutes = calculateAverageReadTimeMinutes(data.readDurationMinutesList);
  const wrongNoticeRate = calculateWrongNoticeRate(data.noticeWrongCount, data.notifiedCount);
  const avgCsat = calculateAverageCsat(data.csatRatings);
  const totalWaitingRoutesCount = data.waitingByTripRouteDate.reduce(
    (acc, item) => acc + item.waitingRequestsCount,
    0
  );

  return [
    {
      id: "kpi-1",
      name: "Tỷ lệ hoàn tất đăng ký chờ",
      definition: "Tỷ lệ người dùng thực sự hoàn tất đăng ký chờ vé sau khi mở biểu mẫu đăng ký.",
      formula: "(Số lượt request_created / Số lượt form_started) * 100%",
      measurementMethod: "Đo lường qua nhật ký AnalyticsEvent ('form_started' và 'request_created').",
      currentValue: `${completionRate}% (${data.requestCreatedCount}/${data.formStartedCount})`,
      rawValue: completionRate,
      decisionThreshold: "Chưa đặt (cần baseline)",
    },
    {
      id: "kpi-2",
      name: "Tỷ lệ thông báo chuyển thành đặt vé",
      definition: "Tỷ lệ hành khách nhận được thông báo 'Có vé phù hợp' và sau đó bấm xác nhận đã đặt vé thành công.",
      formula: "(Số yêu cầu có convertedAt / Tổng số yêu cầu đạt trạng thái 'Có vé phù hợp') * 100%",
      measurementMethod: "Đếm số bản ghi WaitRequest có convertedAt khác null chia cho số yêu cầu có status = 'Có vé phù hợp' hoặc từng được ghép chỗ.",
      currentValue: `${conversionRate}% (${data.convertedRequestsCount}/${data.matchedRequestsCount})`,
      rawValue: conversionRate,
      decisionThreshold: "Chưa đặt (cần baseline)",
    },
    {
      id: "kpi-3",
      name: "Thời gian phản hồi thông báo của hành khách",
      definition: "Thời gian trung bình từ lúc hệ thống gửi thông báo (notifiedAt) đến khi hành khách mở xem thông báo (readAt).",
      formula: "Trung bình cộng (readAt - notifiedAt) tính theo phút",
      measurementMethod: "Tính hiệu số thời gian trên bảng Notification giữa lúc tạo/thông báo và lúc readAt được ghi nhận.",
      currentValue: avgReadMinutes > 0 ? `${avgReadMinutes} phút` : "Chưa có dữ liệu đọc",
      rawValue: avgReadMinutes,
      decisionThreshold: "Chưa đặt (cần baseline)",
    },
    {
      id: "kpi-4",
      name: "Tỷ lệ thông báo sai / không còn chỗ",
      definition: "Tỷ lệ hành khách nhận được thông báo nhưng phản ánh hoặc nhân viên đánh dấu không mua được vé do chậm chân hoặc thông tin sai lệch.",
      formula: "(Số yêu cầu được đánh dấu noticeWrong / Tổng số yêu cầu đã gửi thông báo) * 100%",
      measurementMethod: "Đếm trường noticeWrong = true trên các WaitRequest đã có notifiedAt.",
      currentValue: `${wrongNoticeRate}% (${data.noticeWrongCount}/${data.notifiedCount})`,
      rawValue: wrongNoticeRate,
      decisionThreshold: "Chưa đặt (cần baseline)",
    },
    {
      id: "kpi-5",
      name: "Chỉ số hài lòng khách hàng (CSAT)",
      definition: "Điểm đánh giá mức độ hài lòng của hành khách đối với tính năng chờ vé thông minh (thang điểm 1 đến 5 sao).",
      formula: "Tổng điểm sao đánh giá / Tổng số lượt đánh giá",
      measurementMethod: "Trung bình trường csat (1 - 5) được người dùng gửi sau khi nhận kết quả xử lý.",
      currentValue: avgCsat > 0 ? `${avgCsat} / 5.0 (${data.csatRatings.length} đánh giá)` : "Chưa có đánh giá",
      rawValue: avgCsat,
      decisionThreshold: "Chưa đặt (cần baseline)",
    },
    {
      id: "kpi-6",
      name: "Số lượt chờ theo tuyến, ngày và chuyến",
      definition: "Tổng hợp nhu cầu đang chờ của hành khách phân bổ theo từng chuyến tàu, ngày khởi hành và hành trình.",
      formula: "COUNT(WaitRequest) & SUM(tickets) GROUP BY tripId WHERE status = 'Đang chờ'",
      measurementMethod: "Truy vấn thời gian thực từ bảng WaitRequest và SeatInventory.",
      currentValue: `${totalWaitingRoutesCount} lượt yêu cầu đang chờ (${data.waitingByTripRouteDate.length} cụm chuyến/ngày)`,
      rawValue: totalWaitingRoutesCount,
      decisionThreshold: "Chưa đặt (cần baseline)",
    },
  ];
}
