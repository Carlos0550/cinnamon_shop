/*
  Warnings:

  - You are about to drop the column `is_automatic` on the `Promos` table. All the data in the column will be lost.
  - You are about to drop the column `is_stackable` on the `Promos` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Promos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Promos" DROP COLUMN "is_automatic",
DROP COLUMN "is_stackable",
DROP COLUMN "priority";
