ALTER TABLE "User" ADD COLUMN "canViewConsolidated" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User" SET "canViewConsolidated" = true WHERE "role" = 'SUPERADMIN';
