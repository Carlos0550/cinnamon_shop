/*
  Warnings:

  - You are about to drop the column `clerk_user_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `is_clerk` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX IF EXISTS "User_clerk_user_id_key";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "clerk_user_id",
DROP COLUMN IF EXISTS "is_clerk";

-- AddForeignKey
--ALTER TABLE "Orders" ADD CONSTRAINT "Orders_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;