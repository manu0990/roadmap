/*
  Warnings:

  - The values [SPEED_BUMP] on the enum `HazardType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."HazardType_new" AS ENUM ('POTHOLE', 'SINGLE_SPEED_BUMP', 'MULTIPLE_SPEED_BUMP', 'ROAD_PATCH');
ALTER TABLE "public"."Report" ALTER COLUMN "type" TYPE "public"."HazardType_new" USING ("type"::text::"public"."HazardType_new");
ALTER TYPE "public"."HazardType" RENAME TO "HazardType_old";
ALTER TYPE "public"."HazardType_new" RENAME TO "HazardType";
DROP TYPE "public"."HazardType_old";
COMMIT;
