-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0.00,
ADD COLUMN     "promoId" TEXT,
ADD COLUMN     "promo_code" TEXT,
ADD COLUMN     "subtotal" DOUBLE PRECISION DEFAULT 0.00;

-- CreateIndex
CREATE INDEX "Orders_promo_code_idx" ON "Orders"("promo_code");

-- CreateIndex
CREATE INDEX "Orders_promoId_idx" ON "Orders"("promoId");

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "Promos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

