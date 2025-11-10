-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "loadedManually" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manualProducts" JSONB DEFAULT '[]';
