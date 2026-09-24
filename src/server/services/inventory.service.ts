import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrganizationId } from "@/server/services/auth.service";

const decimal = (value: string) => {
  try {
    const amount = new Prisma.Decimal(value.trim().replace(",", ".") || "0");
    if (amount.isNegative()) throw new Error("Stok awal tidak boleh negatif");
    return amount;
  } catch {
    throw new Error("Stok awal tidak valid");
  }
};

function quantityFromDescription(description: string | null) {
  const match = description?.match(/\(([\d.,]+)\s*(?:pcs?|unit|buah|kg)?\)/i);
  if (!match) return null;
  try {
    const amount = new Prisma.Decimal(match[1].replace(",", "."));
    return amount.gt(0) ? amount : null;
  } catch {
    return null;
  }
}

export async function createInventoryItem(input: { name: string; unit: string; openingStock: string }) {
  const organizationId = await requireOrganizationId();
  const name = input.name.trim();
  const unit = input.unit.trim();
  if (!name || name.length > 150) throw new Error("Nama barang wajib diisi");
  if (!unit || unit.length > 30) throw new Error("Satuan barang wajib diisi");
  return prisma.inventoryItem.create({ data: { organizationId, name, unit, openingStock: decimal(input.openingStock) } });
}

export async function updateInventoryItem(id: string, input: { name: string; unit: string; openingStock: string }) {
  const organizationId = await requireOrganizationId();
  const name = input.name.trim();
  const unit = input.unit.trim();
  if (!id) throw new Error("Barang tidak valid");
  if (!name || name.length > 150) throw new Error("Nama barang wajib diisi");
  if (!unit || unit.length > 30) throw new Error("Satuan barang wajib diisi");
  const result = await prisma.inventoryItem.updateMany({ where: { id, organizationId }, data: { name, unit, openingStock: decimal(input.openingStock) } });
  if (result.count !== 1) throw new Error("Barang tidak ditemukan");
  return result;
}

export async function deleteInventoryItem(id: string) {
  const organizationId = await requireOrganizationId();
  const item = await prisma.inventoryItem.findFirst({ where: { id, organizationId }, select: { _count: { select: { journalTransactions: true } } } });
  if (!item) throw new Error("Barang tidak ditemukan");
  if (item._count.journalTransactions > 0) throw new Error("Barang sudah memiliki riwayat jurnal dan tidak dapat dihapus");
  return prisma.inventoryItem.delete({ where: { id } });
}

export async function listInventoryItems() {
  const organizationId = await requireOrganizationId();
  const items = await prisma.inventoryItem.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: "asc" },
    include: { journalTransactions: { orderBy: { transactionDate: "asc" }, include: { accountingPeriod: { select: { month: true, year: true } }, coaAccount: { select: { code: true, name: true } } } } },
  });
  const automaticTransactions = await prisma.journalTransaction.findMany({
    where: { organizationId, inventoryItemId: null },
    orderBy: { transactionDate: "asc" },
    include: { accountingPeriod: { select: { month: true, year: true } }, coaAccount: { select: { code: true, name: true } } },
  });
  return items.map((item) => {
    let stock = new Prisma.Decimal(item.openingStock);
    let value = new Prisma.Decimal(0);
    // ponytail: scan sederhana cukup untuk demo; gunakan pencocokan terindeks jika volume jurnal besar.
    const automaticItemTransactions = automaticTransactions.filter((transaction) => {
      const description = transaction.description?.toLocaleLowerCase("id-ID") ?? "";
      const account = transaction.coaAccount.name.toLocaleLowerCase("id-ID");
      return description.includes(item.name.toLocaleLowerCase("id-ID")) && account.includes("persediaan") && quantityFromDescription(transaction.description);
    });
    const transactions = [...item.journalTransactions, ...automaticItemTransactions].sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
    const movements = transactions.map((transaction) => {
      const incoming = transaction.debit.gt(0);
      const quantity = transaction.inventoryQuantity.isZero() ? quantityFromDescription(transaction.description) ?? new Prisma.Decimal(0) : transaction.inventoryQuantity;
      const signedQuantity = incoming ? quantity : quantity.neg();
      stock = stock.plus(signedQuantity);
      value = value.plus(transaction.debit.minus(transaction.credit));
      return { id: transaction.id, date: transaction.transactionDate, description: transaction.description || "-", account: transaction.coaAccount.code + " · " + transaction.coaAccount.name, direction: incoming ? "MASUK" : "KELUAR", quantity: quantity.toString(), value: transaction.debit.minus(transaction.credit).toString(), period: transaction.accountingPeriod.month + "/" + transaction.accountingPeriod.year };
    });
    return { id: item.id, name: item.name, unit: item.unit, openingStock: item.openingStock.toString(), stock: stock.toString(), value: value.toString(), movements };
  });
}
