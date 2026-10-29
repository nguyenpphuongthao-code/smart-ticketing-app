"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";

export interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
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

  await setSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "PASSENGER" | "STAFF",
    defaultChannel: user.defaultChannel as "WEBSITE" | "SMS" | "EMAIL",
  });

  const redirectTo = formData.get("redirectTo") as string;
  if (redirectTo && redirectTo.startsWith("/")) {
    redirect(redirectTo);
  } else if (user.role === "STAFF") {
    redirect("/quan-tri");
  } else {
    redirect("/yeu-cau");
  }
}

export async function quickLoginAction(email: string, redirectTo?: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    throw new Error("Tài khoản demo không tồn tại");
  }

  await setSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "PASSENGER" | "STAFF",
    defaultChannel: user.defaultChannel as "WEBSITE" | "SMS" | "EMAIL",
  });

  if (redirectTo && redirectTo.startsWith("/")) {
    redirect(redirectTo);
  } else if (user.role === "STAFF") {
    redirect("/quan-tri");
  } else {
    redirect("/yeu-cau");
  }
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    phone: formData.get("phone") || undefined,
    defaultChannel: formData.get("defaultChannel") || "WEBSITE",
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Thông tin đăng ký không hợp lệ.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
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
  const newUser = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      passwordHash,
      phone: parsed.data.phone?.trim() || null,
      role: "PASSENGER",
      defaultChannel: parsed.data.defaultChannel,
    },
  });

  await setSessionCookie({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: "PASSENGER",
    defaultChannel: newUser.defaultChannel as "WEBSITE" | "SMS" | "EMAIL",
  });

  redirect("/yeu-cau");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/dang-nhap");
}
