# PT. APST

MVP laporan keuangan berbasis Chart of Accounts dengan Next.js App Router, Prisma, PostgreSQL, Zod, dan ExcelJS.

## Jalankan lokal tanpa database

```bash
npm install
npm run dev
```

Buka `http://localhost:3000/dashboard`. Mode demo menampilkan data contoh; input demo tidak disimpan ke PostgreSQL.

## Sambungkan PostgreSQL lokal

1. Salin `.env.example` menjadi `.env` dan sesuaikan `DATABASE_URL`.
2. Jalankan `npm run db:migrate -- --name init`.
3. Jalankan `SEED_ADMIN_PASSWORD="ganti-password-aman" npm run db:seed` untuk mengisi data demo.

Seed membuat user admin, COA, satu periode berjalan, dan saldo contoh.

## Pemeriksaan

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Engine laporan memakai `Prisma.Decimal`; `normalBalance` disimpan sebagai metadata karena MVP menerima saldo akhir akun, bukan jurnal debit/kredit.
