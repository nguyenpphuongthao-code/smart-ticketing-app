import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "./db";

/**
 * Perform constant-time string comparison to defend against timing attacks.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, "utf-8");
    const bBuf = Buffer.from(b, "utf-8");
    if (aBuf.length !== bBuf.length) {
      // Dummy check with self to balance execution time
      crypto.timingSafeEqual(aBuf, aBuf);
      return false;
    }
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}


const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "smart-ticket-waitlist-demo-secret-key-32chars-min!"
);

const SESSION_COOKIE_NAME = "auth_session";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "PASSENGER" | "STAFF";
  defaultChannel: "WEBSITE" | "SMS" | "EMAIL";
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    defaultChannel: user.defaultChannel,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as "PASSENGER" | "STAFF",
      defaultChannel: (payload.defaultChannel as "WEBSITE" | "SMS" | "EMAIL") || "WEBSITE",
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearSessionCookie() {
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireStaff(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== "STAFF") {
    throw new Error("FORBIDDEN_STAFF_ONLY");
  }
  return session;
}
