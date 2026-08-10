/*
  Warnings:

  - You are about to drop the column `categories` on the `Event` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "categories";

-- AlterTable
ALTER TABLE "EventEntry" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "EventCategory" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fee" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventEntryCategory" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "fee" INTEGER NOT NULL,

    CONSTRAINT "EventEntryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventCategory_eventId_name_key" ON "EventCategory"("eventId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EventEntryCategory_entryId_categoryId_key" ON "EventEntryCategory"("entryId", "categoryId");

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntryCategory" ADD CONSTRAINT "EventEntryCategory_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "EventEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntryCategory" ADD CONSTRAINT "EventEntryCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EventCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
