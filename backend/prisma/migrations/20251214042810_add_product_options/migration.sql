-- AlterTable
ALTER TABLE "OrderItems" ADD COLUMN     "selected_options" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "options" JSONB NOT NULL DEFAULT '[]';
