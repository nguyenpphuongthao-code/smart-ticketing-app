-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PASSENGER',
    "defaultChannel" TEXT NOT NULL DEFAULT 'WEBSITE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureDate" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SeatInventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "seatClass" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL,
    CONSTRAINT "SeatInventory_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaitRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "seatClass" TEXT NOT NULL,
    "tickets" INTEGER NOT NULL,
    "acceptDateShift" BOOLEAN NOT NULL DEFAULT false,
    "acceptOtherTrip" BOOLEAN NOT NULL DEFAULT false,
    "acceptOtherClass" BOOLEAN NOT NULL DEFAULT false,
    "channel" TEXT NOT NULL DEFAULT 'WEBSITE',
    "status" TEXT NOT NULL DEFAULT 'Đang chờ',
    "suggestedTripId" TEXT,
    "suggestedSeatClass" TEXT,
    "staffNote" TEXT,
    "noticeWrong" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusChangedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" DATETIME,
    "convertedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancelReason" TEXT,
    "csat" INTEGER,
    CONSTRAINT "WaitRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WaitRequest_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WaitRequest_suggestedTripId_fkey" FOREIGN KEY ("suggestedTripId") REFERENCES "Trip" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "requestId" TEXT,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WEBSITE',
    "simulated" BOOLEAN NOT NULL DEFAULT true,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "WaitRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Trip_origin_destination_departureDate_idx" ON "Trip"("origin", "destination", "departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "SeatInventory_tripId_seatClass_key" ON "SeatInventory"("tripId", "seatClass");

-- CreateIndex
CREATE UNIQUE INDEX "WaitRequest_code_key" ON "WaitRequest"("code");

-- CreateIndex
CREATE INDEX "WaitRequest_status_tripId_idx" ON "WaitRequest"("status", "tripId");

-- CreateIndex
CREATE INDEX "WaitRequest_userId_idx" ON "WaitRequest"("userId");
