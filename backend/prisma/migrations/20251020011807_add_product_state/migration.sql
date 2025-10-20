-- CreateEnum
CREATE TYPE "ProductState" AS ENUM ('active', 'inactive', 'draft', 'out_stock', 'discontinued', 'archived', 'deleted');

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "state" "ProductState" NOT NULL DEFAULT 'active',
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 1;
