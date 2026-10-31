import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  await clearSessionCookie();

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return NextResponse.redirect(`${proto}://${host}/dang-nhap`, 303);
  }

  return NextResponse.redirect(new URL("/dang-nhap", request.url), 303);
}

export async function GET(request: Request) {
  await clearSessionCookie();

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return NextResponse.redirect(`${proto}://${host}/dang-nhap`, 303);
  }

  return NextResponse.redirect(new URL("/dang-nhap", request.url), 303);
}
