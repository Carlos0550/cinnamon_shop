-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('percentage', 'fixed');

-- CreateTable
CREATE TABLE "Promos" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "type" "PromoType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "max_discount" DOUBLE PRECISION,
    "min_order_amount" DOUBLE PRECISION,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_automatic" BOOLEAN NOT NULL DEFAULT false,
    "is_stackable" BOOLEAN NOT NULL DEFAULT false,
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "per_user_limit" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,

    CONSTRAINT "Promos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoriesToPromos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoriesToPromos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductsToPromos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductsToPromos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promos_code_key" ON "Promos"("code");

-- CreateIndex
CREATE INDEX "_CategoriesToPromos_B_index" ON "_CategoriesToPromos"("B");

-- CreateIndex
CREATE INDEX "_ProductsToPromos_B_index" ON "_ProductsToPromos"("B");

-- AddForeignKey
ALTER TABLE "Promos" ADD CONSTRAINT "Promos_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToPromos" ADD CONSTRAINT "_CategoriesToPromos_A_fkey" FOREIGN KEY ("A") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToPromos" ADD CONSTRAINT "_CategoriesToPromos_B_fkey" FOREIGN KEY ("B") REFERENCES "Promos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsToPromos" ADD CONSTRAINT "_ProductsToPromos_A_fkey" FOREIGN KEY ("A") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsToPromos" ADD CONSTRAINT "_ProductsToPromos_B_fkey" FOREIGN KEY ("B") REFERENCES "Promos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
