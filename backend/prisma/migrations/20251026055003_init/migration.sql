-- AlterTable
ALTER TABLE "Promos" ADD COLUMN     "all_categories" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "all_products" BOOLEAN NOT NULL DEFAULT false;
