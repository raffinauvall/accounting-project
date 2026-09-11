-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'IMPORT_JOURNAL';

-- CreateTable
CREATE TABLE "JournalTransaction" (
    "id" TEXT NOT NULL,
    "transactionDate" DATE NOT NULL,
    "accountingPeriodId" TEXT NOT NULL,
    "coaAccountId" TEXT NOT NULL,
    "offerNumber" VARCHAR(100),
    "invoiceNumber" VARCHAR(100),
    "description" VARCHAR(500),
    "credit" DECIMAL(19,2) NOT NULL DEFAULT 0,
    "debit" DECIMAL(19,2) NOT NULL DEFAULT 0,
    "importKey" VARCHAR(100) NOT NULL,
    "sourceRow" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JournalTransaction_importKey_key" ON "JournalTransaction"("importKey");

-- CreateIndex
CREATE INDEX "JournalTransaction_accountingPeriodId_idx" ON "JournalTransaction"("accountingPeriodId");

-- CreateIndex
CREATE INDEX "JournalTransaction_coaAccountId_idx" ON "JournalTransaction"("coaAccountId");

-- CreateIndex
CREATE INDEX "JournalTransaction_transactionDate_idx" ON "JournalTransaction"("transactionDate");

-- AddForeignKey
ALTER TABLE "JournalTransaction" ADD CONSTRAINT "JournalTransaction_accountingPeriodId_fkey" FOREIGN KEY ("accountingPeriodId") REFERENCES "AccountingPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalTransaction" ADD CONSTRAINT "JournalTransaction_coaAccountId_fkey" FOREIGN KEY ("coaAccountId") REFERENCES "CoaAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalTransaction" ADD CONSTRAINT "JournalTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
