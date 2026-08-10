/*
  Warnings:

  - A unique constraint covering the columns `[eventId,name,type]` on the table `EventCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EventCategoryType" AS ENUM ('INDIVIDU', 'ESTAFET');

-- DropIndex
DROP INDEX "EventCategory_eventId_name_key";

-- AlterTable
ALTER TABLE "EventCategory" ADD COLUMN     "type" "EventCategoryType" NOT NULL DEFAULT 'INDIVIDU';

-- CreateIndex
CREATE UNIQUE INDEX "EventCategory_eventId_name_type_key" ON "EventCategory"("eventId", "name", "type");
