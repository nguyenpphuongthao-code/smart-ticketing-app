export const REQUEST_STATUS = {
  PENDING: "Đang chờ",
  MATCHED: "Có vé phù hợp",
  CANCELLED: "Đã hủy",
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export const SEAT_CLASSES = [
  "Ghế ngồi mềm",
  "Giường nằm khoang 4",
  "Giường nằm khoang 6",
] as const;

export type SeatClass = (typeof SEAT_CLASSES)[number];

export const CHANNELS = ["WEBSITE", "SMS", "EMAIL"] as const;
export type ChannelType = (typeof CHANNELS)[number];

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  WEBSITE: "Website",
  SMS: "SMS",
  EMAIL: "Email",
};

export const SIMULATION_BANNER_TEXT =
  "Dữ liệu giả lập – sản phẩm minh họa của nhóm sinh viên, không phải hệ thống chính thức. Vui lòng không nhập thông tin cá nhân thật.";
