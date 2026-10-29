import { z } from "zod";
import { SEAT_CLASSES, CHANNELS, REQUEST_STATUS } from "./constants";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Địa chỉ email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Vui lòng xác nhận mật khẩu"),
    phone: z.string().optional(),
    defaultChannel: z.enum(CHANNELS).default("WEBSITE"),
    accountType: z.enum(["PASSENGER", "STAFF"]).default("PASSENGER"),
    inviteCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.accountType === "STAFF") {
        return !!data.inviteCode && data.inviteCode.trim().length > 0;
      }
      return true;
    },
    {
      message: "Vui lòng nhập mã mời quản trị",
      path: ["inviteCode"],
    }
  );

export const loginSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  accountType: z.enum(["PASSENGER", "STAFF"]).default("PASSENGER"),
});

export const createWaitRequestSchema = z.object({
  tripId: z.string().min(1, "Vui lòng chọn chuyến đi"),
  seatClass: z.enum(SEAT_CLASSES, {
    errorMap: () => ({ message: "Vui lòng chọn loại chỗ hợp lệ" }),
  }),
  tickets: z
    .number()
    .int()
    .min(1, "Số vé tối thiểu là 1")
    .max(6, "Số vé tối đa là 6"),
  acceptDateShift: z.boolean().default(false),
  acceptOtherTrip: z.boolean().default(false),
  acceptOtherClass: z.boolean().default(false),
  channel: z.enum(CHANNELS).default("WEBSITE"),
});

export const cancelRequestSchema = z.object({
  reason: z.string().optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum([REQUEST_STATUS.MATCHED, REQUEST_STATUS.CANCELLED]),
  suggestedTripId: z.string().optional(),
  suggestedSeatClass: z.string().optional(),
  staffNote: z.string().optional(),
  noticeWrong: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
  defaultChannel: z.enum(CHANNELS),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const updateInventorySchema = z.object({
  capacity: z.number().int().min(0, "Sức chứa không được âm"),
  sold: z.number().int().min(0, "Số vé đã bán không được âm"),
});

export const returnTicketSchema = z.object({
  tripId: z.string().min(1, "Vui lòng chọn chuyến tàu"),
  seatClass: z.enum(SEAT_CLASSES),
  quantity: z.number().int().min(1, "Số lượng vé trả ít nhất là 1"),
});

export const rateCsatSchema = z.object({
  csat: z.number().int().min(1).max(5),
});
