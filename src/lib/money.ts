import { Prisma } from "@prisma/client";

export const money = (value: Prisma.Decimal | string | number) =>
  `Rp ${new Intl.NumberFormat("id-ID").format(BigInt(new Prisma.Decimal(value).toFixed(0)))}`;

export const decimal = (value: Prisma.Decimal | string | number) => new Prisma.Decimal(value);
