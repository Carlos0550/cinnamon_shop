/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId]` on the table `BusinessData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,name]` on the table `ColorPalette` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,code]` on the table `Promos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,clerk_user_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- DropIndex
DROP INDEX "Admin_email_key";

-- DropIndex
DROP INDEX "ColorPalette_name_key";

-- DropIndex
DROP INDEX "Promos_code_key";

-- DropIndex
DROP INDEX "User_clerk_user_id_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "tenantId" TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BusinessBankData" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "BusinessData" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "ColorPalette" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "FAQ" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "OrderItems" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Promos" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tenantId" TEXT;

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "TenantPlan" NOT NULL DEFAULT 'BASIC',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_domain_key" ON "Domain"("domain");

-- CreateIndex
CREATE INDEX "Domain_tenantId_idx" ON "Domain"("tenantId");

-- CreateIndex
CREATE INDEX "Admin_tenantId_idx" ON "Admin"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_tenantId_email_key" ON "Admin"("tenantId", "email");

-- CreateIndex
CREATE INDEX "BusinessBankData_tenantId_idx" ON "BusinessBankData"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessData_tenantId_key" ON "BusinessData"("tenantId");

-- CreateIndex
CREATE INDEX "Cart_tenantId_idx" ON "Cart"("tenantId");

-- CreateIndex
CREATE INDEX "Categories_tenantId_idx" ON "Categories"("tenantId");

-- CreateIndex
CREATE INDEX "ColorPalette_tenantId_idx" ON "ColorPalette"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ColorPalette_tenantId_name_key" ON "ColorPalette"("tenantId", "name");

-- CreateIndex
CREATE INDEX "FAQ_tenantId_idx" ON "FAQ"("tenantId");

-- CreateIndex
CREATE INDEX "OrderItems_tenantId_idx" ON "OrderItems"("tenantId");

-- CreateIndex
CREATE INDEX "Orders_tenantId_idx" ON "Orders"("tenantId");

-- CreateIndex
CREATE INDEX "Products_tenantId_idx" ON "Products"("tenantId");

-- CreateIndex
CREATE INDEX "Promos_tenantId_idx" ON "Promos"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Promos_tenantId_code_key" ON "Promos"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Sales_tenantId_idx" ON "Sales"("tenantId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_clerk_user_id_key" ON "User"("tenantId", "clerk_user_id");

-- AddForeignKey
ALTER TABLE "Domain" DROP CONSTRAINT IF EXISTS "Domain_tenantId_fkey";
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_tenantId_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT IF EXISTS "Admin_tenantId_fkey";
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categories" DROP CONSTRAINT IF EXISTS "Categories_tenantId_fkey";
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" DROP CONSTRAINT IF EXISTS "Products_tenantId_fkey";
ALTER TABLE "Products" ADD CONSTRAINT "Products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promos" DROP CONSTRAINT IF EXISTS "Promos_tenantId_fkey";
ALTER TABLE "Promos" ADD CONSTRAINT "Promos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT IF EXISTS "Sales_tenantId_fkey";
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT IF EXISTS "Cart_tenantId_fkey";
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT IF EXISTS "OrderItems_tenantId_fkey";
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT IF EXISTS "Orders_saleId_fkey";
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT IF EXISTS "Orders_tenantId_fkey";
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" DROP CONSTRAINT IF EXISTS "FAQ_tenantId_fkey";
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessData" DROP CONSTRAINT IF EXISTS "BusinessData_tenantId_fkey";
ALTER TABLE "BusinessData" ADD CONSTRAINT "BusinessData_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessBankData" DROP CONSTRAINT IF EXISTS "BusinessBankData_tenantId_fkey";
ALTER TABLE "BusinessBankData" ADD CONSTRAINT "BusinessBankData_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorPalette" DROP CONSTRAINT IF EXISTS "ColorPalette_tenantId_fkey";
ALTER TABLE "ColorPalette" ADD CONSTRAINT "ColorPalette_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
