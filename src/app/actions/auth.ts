"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setSessionCookie, clearSessionCookie, constantTimeCompare } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";
import { isAccountAllowed, recordAllowedAccount, recordLoginTime } from "@/lib/allowedAccounts";

export interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: formData.get("accountType") || "PASSENGER",
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Vui lòng kiểm tra lại thông tin đăng nhập.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });

  if (!user) {
    return {
      success: false,
      error: "Email hoặc mật khẩu không chính xác.",
    };
  }

  const isPasswordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isPasswordValid) {
    return {
      success: false,
      error: "Email hoặc mật khẩu không chính xác.",
    };
  }

  // Enforce server-side role matching
  if (user.role !== parsed.data.accountType) {
    return {
      success: false,
      error: "Tài khoản này không thuộc loại đã chọn. Vui lòng chọn đúng loại tài khoản.",
    };
  }

  // Check if account is recorded in allowed accounts list
  if (!isAccountAllowed(user.email)) {
    return {
      success: false,
      error: "Tài khoản không có trong danh sách được phép đăng nhập của hệ thống.",
    };
  }

  recordLoginTime(user.email);

  await setSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "PASSENGER" | "STAFF",
    defaultChannel: user.defaultChannel as "WEBSITE" | "SMS" | "EMAIL",
  });

  const redirectTo = formData.get("redirectTo") as string;
  if (user.role === "STAFF") {
    if (redirectTo && redirectTo.startsWith("/") && redirectTo.startsWith("/quan-tri")) {
      redirect(redirectTo);
    }
    redirect("/quan-tri");
  } else {
    if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("/quan-tri")) {
      redirect(redirectTo);
    }
    redirect("/yeu-cau");
  }
}

export async function quickLoginAction(
  email: string,
  expectedRole: "PASSENGER" | "STAFF" = "PASSENGER",
  redirectTo?: string
): Promise<ActionResult | void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return {
      success: false,
      error: "Tài khoản demo không tồn tại",
    };
  }

  if (user.role !== expectedRole) {
    return {
      success: false,
      error: "Tài khoản này không thuộc loại đã chọn. Vui lòng chọn đúng loại tài khoản.",
    };
  }

  await setSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "PASSENGER" | "STAFF",
    defaultChannel: user.defaultChannel as "WEBSITE" | "SMS" | "EMAIL",
  });

  if (user.role === "STAFF") {
    if (redirectTo && redirectTo.startsWith("/") && redirectTo.startsWith("/quan-tri")) {
      redirect(redirectTo);
    }
    redirect("/quan-tri");
  } else {
    if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("/quan-tri")) {
      redirect(redirectTo);
    }
    redirect("/yeu-cau");
  }
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const accountType = (formData.get("accountType") as string) || "PASSENGER";

  const rawData: any = {
    accountType,
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  if (accountType === "STAFF") {
    rawData.inviteCode = formData.get("inviteCode");
    rawData.defaultChannel = "WEBSITE";
  } else {
    rawData.phone = formData.get("phone") || undefined;
    rawData.defaultChannel = formData.get("defaultChannel") || "WEBSITE";
  }

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Thông tin đăng ký không hợp lệ.";
    return {
      success: false,
      error: firstError,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Staff registration validation: check process.env.STAFF_INVITE_CODE
  if (accountType === "STAFF") {
    const envInviteCode = process.env.STAFF_INVITE_CODE;
    if (!envInviteCode || envInviteCode.trim() === "") {
      return {
        success: false,
        error: "Đăng ký tài khoản quản trị hiện chưa được mở.",
      };
    }

    const submittedCode = (parsed.data.inviteCode || "").trim();
    if (!submittedCode || !constantTimeCompare(submittedCode, envInviteCode.trim())) {
      return {
        success: false,
        error: "Mã mời không đúng.",
      };
    }
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });

  if (existing) {
    return {
      success: false,
      error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  // Derive role server-side only
  const role: "PASSENGER" | "STAFF" = accountType === "STAFF" ? "STAFF" : "PASSENGER";

  const newUser = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      passwordHash,
      phone: role === "PASSENGER" ? (parsed.data.phone?.trim() || null) : null,
      role,
      defaultChannel: role === "PASSENGER" ? (parsed.data.defaultChannel || "WEBSITE") : "WEBSITE",
    },
  });

  // Automatically record newly registered account in allowed accounts file
  recordAllowedAccount({
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  });

  await setSessionCookie({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role,
    defaultChannel: newUser.defaultChannel as "WEBSITE" | "SMS" | "EMAIL",
  });

  if (role === "STAFF") {
    redirect("/quan-tri");
  } else {
    redirect("/yeu-cau");
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/dang-nhap");
}

