-- CreateTable
CREATE TABLE "BusinessData" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "BusinessData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessBankData" (
    "id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_holder" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "BusinessBankData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BusinessBankData" ADD CONSTRAINT "BusinessBankData_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

