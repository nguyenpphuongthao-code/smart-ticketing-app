import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { constantTimeCompare, createSessionToken } from "../lib/auth";

// In-memory cookie store for testing server actions
const mockCookieMap = new Map<string, { value: string }>();

vi.mock("next/headers", () => {
    return {
        cookies: () => ({
            get: (key: string) => mockCookieMap.get(key),
            set: (key: string, value: string) => mockCookieMap.set(key, { value }),
            delete: (key: string) => mockCookieMap.delete(key),
        }),
    };
});

vi.mock("next/navigation", () => {
    return {
        redirect: (url: string) => {
            const err = new Error(`NEXT_REDIRECT:${url}`);
            (err as any).digest = `NEXT_REDIRECT;replace;${url};307;;`;
            (err as any).url = url;
            throw err;
        },
    };
});

// Import actions after mocking headers & navigation
import { loginAction, quickLoginAction, registerAction } from "../app/actions/auth";
import { requireStaff } from "../lib/auth";
import { middleware } from "../../middleware";

const prisma = new PrismaClient();

describe("Authentication & Role Separation Acceptance Tests", () => {
    const originalEnv = process.env.STAFF_INVITE_CODE;

    beforeAll(async () => {
        mockCookieMap.clear();
    });

    afterAll(async () => {
        process.env.STAFF_INVITE_CODE = originalEnv;
        // Clean up created test users
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        "test_passenger_new@demo.local",
                        "test_staff_new@demo.local",
                        "test_staff_refused@demo.local",
                        "test_staff_wrong@demo.local",
                    ],
                },
            },
        });
        await prisma.$disconnect();
    });

    beforeEach(() => {
        mockCookieMap.clear();
    });

    // Acceptance Test 1
    it("1) Login as nhanvien@demo.local with 'Quản trị' selected -> goes to /quan-tri", async () => {
        const formData = new FormData();
        formData.set("email", "nhanvien@demo.local");
        formData.set("password", "Demo@12345");
        formData.set("accountType", "STAFF");

        try {
            await loginAction(formData);
            expect.fail("Expected redirect to /quan-tri");
        } catch (err: any) {
            expect(err.message).toBe("NEXT_REDIRECT:/quan-tri");
        }

        // Verify session cookie was set with role STAFF
        const sessionCookie = mockCookieMap.get("auth_session");
        expect(sessionCookie).toBeDefined();
    });

    // Acceptance Test 2
    it("2) Login as nhanvien@demo.local with 'Hành khách' selected -> rejected with mismatch message", async () => {
        const formData = new FormData();
        formData.set("email", "nhanvien@demo.local");
        formData.set("password", "Demo@12345");
        formData.set("accountType", "PASSENGER");

        const result = await loginAction(formData);
        expect(result.success).toBe(false);
        expect(result.error).toBe(
            "Tài khoản này không thuộc loại đã chọn. Vui lòng chọn đúng loại tài khoản."
        );

        // Verify NO session cookie was set
        const sessionCookie = mockCookieMap.get("auth_session");
        expect(sessionCookie).toBeUndefined();
    });

    // Acceptance Test 3
    it("3) Login as khach1@demo.local with 'Quản trị' selected -> rejected; with 'Hành khách' -> success", async () => {
        // 3a. Rejected when 'STAFF' selected
        const formDataWrong = new FormData();
        formDataWrong.set("email", "khach1@demo.local");
        formDataWrong.set("password", "Demo@12345");
        formDataWrong.set("accountType", "STAFF");

        const resultWrong = await loginAction(formDataWrong);
        expect(resultWrong.success).toBe(false);
        expect(resultWrong.error).toBe(
            "Tài khoản này không thuộc loại đã chọn. Vui lòng chọn đúng loại tài khoản."
        );
        expect(mockCookieMap.get("auth_session")).toBeUndefined();

        // 3b. Success when 'PASSENGER' selected
        const formDataCorrect = new FormData();
        formDataCorrect.set("email", "khach1@demo.local");
        formDataCorrect.set("password", "Demo@12345");
        formDataCorrect.set("accountType", "PASSENGER");

        try {
            await loginAction(formDataCorrect);
            expect.fail("Expected redirect to /yeu-cau");
        } catch (err: any) {
            expect(err.message).toBe("NEXT_REDIRECT:/yeu-cau");
        }

        const sessionCookie = mockCookieMap.get("auth_session");
        expect(sessionCookie).toBeDefined();
    });

    // Acceptance Test 4
    it("4) Register a new passenger -> works; new user has role PASSENGER", async () => {
        // Clean up if existed from previous run
        await prisma.user.deleteMany({
            where: { email: "test_passenger_new@demo.local" },
        });

        const formData = new FormData();
        formData.set("accountType", "PASSENGER");
        formData.set("name", "Khách Hàng Mới");
        formData.set("email", "test_passenger_new@demo.local");
        formData.set("password", "Demo@12345");
        formData.set("confirmPassword", "Demo@12345");
        formData.set("phone", "0988776655");
        formData.set("defaultChannel", "EMAIL");

        try {
            await registerAction(formData);
            expect.fail("Expected redirect to /yeu-cau");
        } catch (err: any) {
            expect(err.message).toBe("NEXT_REDIRECT:/yeu-cau");
        }

        const createdUser = await prisma.user.findUnique({
            where: { email: "test_passenger_new@demo.local" },
        });
        expect(createdUser).not.toBeNull();
        expect(createdUser?.role).toBe("PASSENGER");
        expect(createdUser?.phone).toBe("0988776655");
        expect(createdUser?.defaultChannel).toBe("EMAIL");
    });

    // Acceptance Test 5
    it("5) Register with 'Quản trị' and a wrong or empty invite code -> rejected, no user created", async () => {
        process.env.STAFF_INVITE_CODE = "SECRET_STAFF_INVITE_2027";

        // 5a. Wrong invite code
        const formDataWrong = new FormData();
        formDataWrong.set("accountType", "STAFF");
        formDataWrong.set("name", "Quản Trị Sai Mã");
        formDataWrong.set("email", "test_staff_wrong@demo.local");
        formDataWrong.set("password", "Demo@12345");
        formDataWrong.set("confirmPassword", "Demo@12345");
        formDataWrong.set("inviteCode", "WRONG_CODE_XYZ");

        const resultWrong = await registerAction(formDataWrong);
        expect(resultWrong.success).toBe(false);
        expect(resultWrong.error).toBe("Mã mời không đúng.");

        const userWrong = await prisma.user.findUnique({
            where: { email: "test_staff_wrong@demo.local" },
        });
        expect(userWrong).toBeNull();

        // 5b. Empty invite code
        const formDataEmpty = new FormData();
        formDataEmpty.set("accountType", "STAFF");
        formDataEmpty.set("name", "Quản Trị Thiếu Mã");
        formDataEmpty.set("email", "test_staff_wrong@demo.local");
        formDataEmpty.set("password", "Demo@12345");
        formDataEmpty.set("confirmPassword", "Demo@12345");
        formDataEmpty.set("inviteCode", "");

        const resultEmpty = await registerAction(formDataEmpty);
        expect(resultEmpty.success).toBe(false);
        expect(resultEmpty.error).toBe("Vui lòng nhập mã mời quản trị");

        const userEmpty = await prisma.user.findUnique({
            where: { email: "test_staff_wrong@demo.local" },
        });
        expect(userEmpty).toBeNull();
    });

    // Acceptance Test 6
    it("6) Register with 'Quản trị' and the correct STAFF_INVITE_CODE -> user created with role STAFF", async () => {
        process.env.STAFF_INVITE_CODE = "SECRET_STAFF_INVITE_2027";

        await prisma.user.deleteMany({
            where: { email: "test_staff_new@demo.local" },
        });

        const formData = new FormData();
        formData.set("accountType", "STAFF");
        formData.set("name", "Nhân Viên Điều Hành Mới");
        formData.set("email", "test_staff_new@demo.local");
        formData.set("password", "Demo@12345");
        formData.set("confirmPassword", "Demo@12345");
        formData.set("inviteCode", "SECRET_STAFF_INVITE_2027");

        try {
            await registerAction(formData);
            expect.fail("Expected redirect to /quan-tri");
        } catch (err: any) {
            expect(err.message).toBe("NEXT_REDIRECT:/quan-tri");
        }

        const createdStaff = await prisma.user.findUnique({
            where: { email: "test_staff_new@demo.local" },
        });
        expect(createdStaff).not.toBeNull();
        expect(createdStaff?.role).toBe("STAFF");
    });

    // Acceptance Test 7
    it("7) With STAFF_INVITE_CODE unset, staff registration is refused", async () => {
        delete process.env.STAFF_INVITE_CODE;

        const formData = new FormData();
        formData.set("accountType", "STAFF");
        formData.set("name", "Nhân Viên Bị Từ Chối");
        formData.set("email", "test_staff_refused@demo.local");
        formData.set("password", "Demo@12345");
        formData.set("confirmPassword", "Demo@12345");
        formData.set("inviteCode", "ANY_CODE");

        const res = await registerAction(formData);
        expect(res.success).toBe(false);
        expect(res.error).toBe("Đăng ký tài khoản quản trị hiện chưa được mở.");

        const user = await prisma.user.findUnique({
            where: { email: "test_staff_refused@demo.local" },
        });
        expect(user).toBeNull();
    });

    // Acceptance Test 8
    it("8) Logged in as a passenger, opening /quan-tri directly is blocked", async () => {
        const passengerToken = await createSessionToken({
            id: "khach-id-123",
            name: "Nguyễn Văn An",
            email: "khach1@demo.local",
            role: "PASSENGER",
            defaultChannel: "WEBSITE",
        });

        // Test 8a: Middleware blocks passenger session with HTTP 403 Forbidden
        const req = new NextRequest("http://localhost:3000/quan-tri", {
            headers: {
                cookie: `auth_session=${passengerToken}`,
            },
        });

        const response = await middleware(req);
        expect(response.status).toBe(403);
        const bodyText = await response.text();
        expect(bodyText).toContain("Forbidden");

        // Test 8b: Server-side requireStaff helper throws FORBIDDEN_STAFF_ONLY
        mockCookieMap.set("auth_session", { value: passengerToken });
        await expect(requireStaff()).rejects.toThrow("FORBIDDEN_STAFF_ONLY");

        // Test 8c: STAFF session can access /quan-tri through middleware
        const staffToken = await createSessionToken({
            id: "nhanvien-id-456",
            name: "Nhân Viên Điều Hành",
            email: "nhanvien@demo.local",
            role: "STAFF",
            defaultChannel: "WEBSITE",
        });

        const staffReq = new NextRequest("http://localhost:3000/quan-tri", {
            headers: {
                cookie: `auth_session=${staffToken}`,
            },
        });
        const staffResponse = await middleware(staffReq);
        expect(staffResponse.status).toBe(200);
    });

    // Quick Login Action role enforcement
    it("quickLoginAction rejects role mismatch and accepts matching role", async () => {
        // Mismatch: khach1 with STAFF expected
        const res1 = await quickLoginAction("khach1@demo.local", "STAFF");
        expect(res1 && !res1.success && res1.error).toBe(
            "Tài khoản này không thuộc loại đã chọn. Vui lòng chọn đúng loại tài khoản."
        );

        // Match: nhanvien with STAFF expected
        try {
            await quickLoginAction("nhanvien@demo.local", "STAFF");
            expect.fail("Expected redirect to /quan-tri");
        } catch (err: any) {
            expect(err.message).toBe("NEXT_REDIRECT:/quan-tri");
        }
    });

    // Constant-time comparison unit test
    it("constantTimeCompare performs safe string comparison", () => {
        expect(constantTimeCompare("secret123", "secret123")).toBe(true);
        expect(constantTimeCompare("secret123", "secret124")).toBe(false);
        expect(constantTimeCompare("short", "longerstring")).toBe(false);
        expect(constantTimeCompare("", "")).toBe(true);
    });
});
