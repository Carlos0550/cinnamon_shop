-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('deleted', 'active', 'inactive');

-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "status" "CategoryStatus" NOT NULL DEFAULT 'active';
