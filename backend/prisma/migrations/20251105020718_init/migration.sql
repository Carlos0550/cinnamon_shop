-- CreateEnum
CREATE TYPE "SaleSource" AS ENUM ('WEB', 'CAJA');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TARJETA', 'EFECTIVO', 'QR', 'NINGUNO');

-- CreateTable
CREATE TABLE "Sales" (
    "id" TEXT NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "source" "SaleSource" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductsToSales" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductsToSales_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Sales_created_at_idx" ON "Sales"("created_at");

-- CreateIndex
CREATE INDEX "Sales_userId_idx" ON "Sales"("userId");

-- CreateIndex
CREATE INDEX "_ProductsToSales_B_index" ON "_ProductsToSales"("B");

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsToSales" ADD CONSTRAINT "_ProductsToSales_A_fkey" FOREIGN KEY ("A") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsToSales" ADD CONSTRAINT "_ProductsToSales_B_fkey" FOREIGN KEY ("B") REFERENCES "Sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
