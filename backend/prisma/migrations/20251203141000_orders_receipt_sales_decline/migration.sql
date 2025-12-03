ALTER TABLE "Orders" ADD COLUMN "transfer_receipt_path" TEXT;
ALTER TABLE "Sales" ADD COLUMN "declined" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Sales" ADD COLUMN "decline_reason" TEXT;
