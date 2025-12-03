-- Add saleId column to Orders and relation to Sales
ALTER TABLE "Orders" ADD COLUMN "saleId" TEXT;
CREATE INDEX IF NOT EXISTS "Orders_saleId_idx" ON "Orders"("saleId");

-- Optional: backfill existing orders if mapping exists elsewhere (skipped)
