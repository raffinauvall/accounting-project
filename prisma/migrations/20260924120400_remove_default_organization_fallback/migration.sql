ALTER TABLE "CoaAccount" ALTER COLUMN "organizationId" DROP DEFAULT;
ALTER TABLE "AccountingPeriod" ALTER COLUMN "organizationId" DROP DEFAULT;
ALTER TABLE "CoaEntry" ALTER COLUMN "organizationId" DROP DEFAULT;
ALTER TABLE "JournalTransaction" ALTER COLUMN "organizationId" DROP DEFAULT;
ALTER TABLE "InventoryItem" ALTER COLUMN "organizationId" DROP DEFAULT;
