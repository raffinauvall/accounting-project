import { prisma } from "@/lib/prisma";

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

  const template = await prisma.organization.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
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

function organizationFields(input: { name: string; slug?: string }) {
  const name = input.name.trim();
  const slug = slugify(input.slug || name);
  if (!name || name.length > 150) throw new Error("Nama organisasi wajib diisi");
  if (!slug) throw new Error("Kode organisasi tidak valid");
  return { name, slug };
}

export async function updateOrganization(id: string, input: { name: string; slug?: string }) {
  return prisma.organization.update({ where: { id }, data: organizationFields(input) });
}

export async function deleteOrganization(id: string) {
  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.findUnique({
      where: { id },
      include: { _count: { select: { users: true, organizationAccesses: true, entries: true, journalTransactions: true, inventoryItems: true } } },
    });
    if (!organization) throw new Error("Organisasi tidak ditemukan");
    if (organization._count.users || organization._count.organizationAccesses || organization._count.entries || organization._count.journalTransactions || organization._count.inventoryItems) {
      throw new Error("Organisasi yang sudah memiliki pengguna atau transaksi tidak dapat dihapus");
    }

    await tx.auditLog.deleteMany({ where: { organizationId: id } });
    await tx.accountingPeriod.deleteMany({ where: { organizationId: id } });
    const accountIds = (await tx.coaAccount.findMany({ where: { organizationId: id }, select: { id: true } })).map((account) => account.id);
    while (accountIds.length) {
      const leaf = await tx.coaAccount.findFirst({ where: { id: { in: accountIds }, children: { none: {} } }, select: { id: true } });
      if (!leaf) throw new Error("Struktur akun organisasi tidak valid");
      await tx.coaAccount.delete({ where: { id: leaf.id } });
      accountIds.splice(accountIds.indexOf(leaf.id), 1);
    }
    return tx.organization.delete({ where: { id } });
  });
}
