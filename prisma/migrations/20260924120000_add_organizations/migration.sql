-- Add the tenant root before attaching existing records to it.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';

CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

INSERT INTO "Organization" ("id", "name", "slug", "updatedAt")
VALUES ('default-org', 'Organisasi Utama', 'utama', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "User" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "CoaAccount" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'default-org';
ALTER TABLE "AccountingPeriod" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'default-org';
ALTER TABLE "CoaEntry" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'default-org';
ALTER TABLE "JournalTransaction" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'default-org';
ALTER TABLE "InventoryItem" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT 'default-org';
ALTER TABLE "AuditLog" ADD COLUMN "organizationId" TEXT;

UPDATE "User" SET "organizationId" = 'default-org' WHERE "organizationId" IS NULL;
UPDATE "AuditLog" AS log
SET "organizationId" = users."organizationId"
FROM "User" AS users
WHERE log."userId" = users."id";

DROP INDEX "CoaAccount_code_key";
DROP INDEX "AccountingPeriod_month_year_key";
DROP INDEX "CoaEntry_coaAccountId_accountingPeriodId_key";
DROP INDEX "JournalTransaction_importKey_key";
DROP INDEX "InventoryItem_name_key";

CREATE UNIQUE INDEX "CoaAccount_organizationId_code_key" ON "CoaAccount"("organizationId", "code");
CREATE UNIQUE INDEX "AccountingPeriod_organizationId_month_year_key" ON "AccountingPeriod"("organizationId", "month", "year");
CREATE UNIQUE INDEX "CoaEntry_organizationId_coaAccountId_accountingPeriodId_key" ON "CoaEntry"("organizationId", "coaAccountId", "accountingPeriodId");
CREATE UNIQUE INDEX "JournalTransaction_organizationId_importKey_key" ON "JournalTransaction"("organizationId", "importKey");
CREATE UNIQUE INDEX "InventoryItem_organizationId_name_key" ON "InventoryItem"("organizationId", "name");

CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX "CoaAccount_organizationId_idx" ON "CoaAccount"("organizationId");
CREATE INDEX "AccountingPeriod_organizationId_idx" ON "AccountingPeriod"("organizationId");
CREATE INDEX "CoaEntry_organizationId_idx" ON "CoaEntry"("organizationId");
CREATE INDEX "JournalTransaction_organizationId_idx" ON "JournalTransaction"("organizationId");
CREATE INDEX "InventoryItem_organizationId_idx" ON "InventoryItem"("organizationId");
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CoaAccount" ADD CONSTRAINT "CoaAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CoaEntry" ADD CONSTRAINT "CoaEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalTransaction" ADD CONSTRAINT "JournalTransaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
