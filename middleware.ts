import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "smart-ticket-waitlist-demo-secret-key-32chars-min!"
);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === "/quan-tri" || pathname.startsWith("/quan-tri/")) {
        const token = request.cookies.get("auth_session")?.value;
        if (!token) {
            const loginUrl = new URL("/dang-nhap", request.url);
            loginUrl.searchParams.set("redirectTo", pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.role !== "STAFF") {
                return new NextResponse("Forbidden: Khu vực dành riêng cho nhân viên điều hành", {
                    status: 403,
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                });
            }
        } catch {
            const loginUrl = new URL("/dang-nhap", request.url);
            loginUrl.searchParams.set("redirectTo", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/quan-tri", "/quan-tri/:path*"],
};
