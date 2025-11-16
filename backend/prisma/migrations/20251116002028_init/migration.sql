/*
  Warnings:

  - A unique constraint covering the columns `[clerk_user_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,role]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."User_email_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clerk_user_id" TEXT,
ADD COLUMN     "is_clerk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_image" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_clerk_user_id_key" ON "User"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_role_key" ON "User"("email", "role");
