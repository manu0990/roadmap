/*
  Warnings:

  - The values [CONSTRUCTION,ACCIDENT,FLOODING,OTHER] on the enum `HazardType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `driverId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ride` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rider` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."HazardType_new" AS ENUM ('POTHOLE', 'SPEED_BUMP', 'ROAD_PATCH');
ALTER TABLE "public"."Report" ALTER COLUMN "type" TYPE "public"."HazardType_new" USING ("type"::text::"public"."HazardType_new");
ALTER TYPE "public"."HazardType" RENAME TO "HazardType_old";
ALTER TYPE "public"."HazardType_new" RENAME TO "HazardType";
DROP TYPE "public"."HazardType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ride" DROP CONSTRAINT "Ride_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ride" DROP CONSTRAINT "Ride_riderId_fkey";

-- AlterTable
ALTER TABLE "public"."Report" DROP COLUMN "driverId",
DROP COLUMN "severity",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Driver";

-- DropTable
DROP TABLE "public"."Ride";

-- DropTable
DROP TABLE "public"."Rider";

-- DropEnum
DROP TYPE "public"."RideStatus";

-- DropEnum
DROP TYPE "public"."Severity";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Confirmation" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isTrue" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Confirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "public"."User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Confirmation_reportId_userId_key" ON "public"."Confirmation"("reportId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Confirmation" ADD CONSTRAINT "Confirmation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Confirmation" ADD CONSTRAINT "Confirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
