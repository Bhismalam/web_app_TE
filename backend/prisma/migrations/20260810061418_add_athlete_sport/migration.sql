-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('SWIMMING', 'FINSWIMMING');

-- AlterTable
ALTER TABLE "AthleteProfile" ADD COLUMN     "sport" "Sport" NOT NULL DEFAULT 'FINSWIMMING';
