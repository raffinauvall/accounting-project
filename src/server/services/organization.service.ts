import { prisma } from "@/lib/prisma";

export const DEFAULT_ORGANIZATION_ID = "default-org";

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export function listOrganizations() {
  return prisma.organization.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, coaAccounts: true, journalTransactions: true } } },
  });
}

export async function createOrganization(input: { name: string; slug?: string }) {
  const name = input.name.trim();
  const slug = slugify(input.slug || name);
  if (!name || name.length > 150) throw new Error("Nama organisasi wajib diisi");
  if (!slug) throw new Error("Kode organisasi tidak valid");

  const template = await prisma.organization.findUnique({
    where: { id: DEFAULT_ORGANIZATION_ID },
    include: {
      coaAccounts: { where: { isActive: true }, orderBy: { code: "asc" }, include: { parent: { select: { code: true } } } },
      accountingPeriods: { orderBy: [{ year: "asc" }, { month: "asc" }] },
    },
  });

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({ data: { name, slug } });
    const accountIds = new Map<string, string>();
    for (const account of template?.coaAccounts ?? []) {
      const created = await tx.coaAccount.create({
        data: {
          organizationId: organization.id,
          code: account.code,
          name: account.name,
          parentId: account.parent?.code ? accountIds.get(account.parent.code) ?? null : null,
          accountType: account.accountType,
          statementType: account.statementType,
          normalBalance: account.normalBalance,
          isActive: true,
          isPostingAccount: account.isPostingAccount,
        },
      });
      accountIds.set(account.code, created.id);
    }
    for (const period of template?.accountingPeriods ?? []) {
      await tx.accountingPeriod.create({
        data: {
          organizationId: organization.id,
          month: period.month,
          year: period.year,
          startDate: period.startDate,
          endDate: period.endDate,
          status: period.status,
        },
      });
    }
    return organization;
  });
}
