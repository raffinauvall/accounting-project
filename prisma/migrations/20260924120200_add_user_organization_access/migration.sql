CREATE TABLE "UserOrganization" (
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOrganization_pkey" PRIMARY KEY ("userId", "organizationId")
);

INSERT INTO "UserOrganization" ("userId", "organizationId")
SELECT "id", "organizationId" FROM "User" WHERE "organizationId" IS NOT NULL
ON CONFLICT ("userId", "organizationId") DO NOTHING;

CREATE INDEX "UserOrganization_organizationId_idx" ON "UserOrganization"("organizationId");

ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserOrganization" ADD CONSTRAINT "UserOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
