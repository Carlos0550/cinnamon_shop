-- AlterTable
ALTER TABLE "BusinessData" ADD COLUMN     "business_image" TEXT,
ADD COLUMN     "favicon" TEXT;

-- AddForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT IF EXISTS "Orders_saleId_fkey";
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
