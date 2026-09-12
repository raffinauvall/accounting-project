# PT. APST — Accounting Project

Aplikasi akuntansi berbasis web untuk mengelola Chart of Accounts (COA), saldo akun, jurnal umum, persediaan, periode akuntansi, dan laporan keuangan.

## Fitur

- Dashboard ringkas kondisi keuangan.
- COA bertingkat dengan akun kelompok dan akun posting.
- Input saldo akun per periode.
- Impor jurnal umum dari Excel (`.xlsx`).
- Pemetaan transaksi jurnal ke barang persediaan dan kuantitasnya.
- Perhitungan stok akhir dan nilai jurnal persediaan.
- Laporan Neraca dan Laba Rugi.
- Unduh laporan Neraca dan Laba Rugi dalam PDF A4 dengan logo APST dan watermark.
- Ekspor laporan Neraca dan Laba Rugi ke Excel.
- Periode akuntansi dengan status terbuka/tertutup.
- Login berbasis session dan role `ADMIN`, `FINANCE`, dan `VIEWER`.
- Audit log untuk perubahan COA, saldo, jurnal, dan periode.
- Modal konfirmasi interaktif untuk simpan, ubah, hapus, impor, bersihkan jurnal, dan logout.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma 6
- PostgreSQL
- ExcelJS
- PDFKit
- Zod
- Tailwind CSS
- Vitest

## Menjalankan proyek

### Prasyarat

- Node.js versi yang kompatibel dengan Next.js 16.
- npm.
- PostgreSQL yang bisa diakses dari aplikasi.

### Instalasi

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/accounting?schema=public"
AUTH_SECRET="ganti-dengan-rahasia-acak-minimal-32-karakter"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="development-only-change-me"
```

Generate Prisma Client dan jalankan migration yang sudah tersedia:

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
```

Seed membuat atau memperbarui:

- user admin dari `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD`;
- COA contoh;
- periode akuntansi berjalan;
- saldo contoh.

Jalankan aplikasi:

```bash
npm run dev
```

Buka `http://localhost:3000` dan login menggunakan credential seed.

## Catatan keamanan production

- Wajib isi `AUTH_SECRET` acak minimal 32 karakter; production tidak lagi memakai `DATABASE_URL` sebagai fallback secret.
- Semua API laporan, template, dan impor jurnal membutuhkan session aktif.
- `VIEWER` hanya dapat membaca; perubahan COA, saldo, periode, persediaan, dan pemetaan jurnal membutuhkan `ADMIN` atau `FINANCE`.
- Impor jurnal menerima `.xlsx` maksimal 20 MB dan menolak request lintas situs.
- Jalankan aplikasi melalui HTTPS dan jangan commit `.env` atau credential seed.

## Perintah yang tersedia

```bash
npm run dev                 # development server
npm run build               # production build
npm run start               # jalankan hasil build
npm run lint                # ESLint
npm test                    # Vitest
npx tsc --noEmit            # type-check TypeScript
npm run db:generate         # generate Prisma Client
npx prisma migrate deploy   # apply migration yang sudah committed
npm run db:migrate          # buat/apply migration saat development schema
npm run db:seed             # seed admin, COA, periode, dan saldo contoh
```

## Alur penggunaan

1. Login sebagai admin atau finance.
2. Periksa atau tambahkan COA di `/coa`.
3. Input saldo awal/periode di `/entries` bila diperlukan.
4. Tambahkan barang di `/inventory` dengan satuan dan stok awal.
5. Impor file jurnal dari `/journal`.
6. Petakan transaksi jurnal ke barang dan isi kuantitasnya.
7. Periksa stok akhir pada `/inventory`.
8. Buka laporan `/reports/balance-sheet` atau `/reports/profit-loss`.
9. Klik `PDF` untuk mengunduh laporan A4 dengan watermark logo APST.

## Impor Excel Jurnal Umum

Halaman `/journal` menerima file `.xlsx` dengan sheet bernama `JURNAL UMUM`. Data transaksi dibaca mulai baris 6.

Kolom penting mengikuti posisi workbook PT KNS:

| Kolom | Isi |
| --- | --- |
| D | Tanggal Pencatatan |
| G | Nomor Penawaran |
| H | Nomor Invoice |
| K | Kategori Nama Akun |
| L | Nomor Akun |
| M | Nama Akun |
| N | Deskripsi Transaksi |
| O | Nominal Masuk/Kredit |
| P | Nominal Keluar/Debet |
| R | HPP tambahan pada file uji; akun HPP tetap dicatat melalui transaksi debit/kredit |

Aturan import:

- ukuran file maksimal 20 MB;
- setiap transaksi wajib memiliki tanggal, nomor akun, dan nominal kredit atau debet;
- jika ada Nomor Akun kosong pada baris transaksi, seluruh impor ditolak dan tidak ada transaksi yang masuk database;
- satu baris hanya boleh mengisi kredit atau debet;
- tanggal Excel atau tanggal teks `dd/mm/yyyy` dapat dibaca;
- periode baru dibuat otomatis dan statusnya `OPEN`;
- akun yang belum ada dapat dibuat otomatis dari sheet `SETUP`;
- nomor akun boleh memakai kode unik bergaya PT KNS seperti `4-40001`; sistem menyimpan kode lengkap dan memakai angka awalnya sebagai fallback klasifikasi akun;
- baris `SETUP` dibaca mulai baris 6 dengan `Nama Akun` di kolom D, `Nomor Akun` di E, dan kategori di F;
- file yang sama dapat diunggah ulang tanpa menggandakan transaksi karena setiap baris memiliki import key;
- periode yang sudah ditutup menolak transaksi baru.

> HPP tidak perlu menjadi field terpisah di database. Untuk pembukuan, buat transaksi debit ke akun HPP dan transaksi kredit ke akun persediaan. Kolom `R` pada workbook uji berfungsi sebagai informasi tambahan.

### File contoh

- [dummy-jurnal-umum-hpp.xlsx](./dummy-jurnal-umum-hpp.xlsx) — contoh jurnal 44 baris dengan tanggal, transaksi penjualan, transaksi HPP, dan sheet `SETUP`.
- [dummy-coa-dengan-hpp.xlsx](./dummy-coa-dengan-hpp.xlsx) — contoh COA dan data item dengan HPP/modal dummy.

Template kosong juga bisa diunduh langsung dari tombol `Unduh templat Excel` di halaman Jurnal Umum.

## Persediaan

Barang dibuat dari `/inventory` dengan:

- nama barang;
- satuan;
- stok awal.

Stok akhir dihitung sebagai:

```text
stok akhir = stok awal + kuantitas jurnal debit - kuantitas jurnal kredit
```

Setelah jurnal diimpor, transaksi perlu dipetakan ke barang dan kuantitas melalui halaman `/journal`. Jurnal debit dianggap sebagai stok masuk; jurnal kredit dianggap sebagai stok keluar.

## Struktur proyek

```text
src/
├── app/                    # halaman Next.js, server actions, dan API routes
├── components/             # komponen UI
├── lib/                    # Prisma, data demo, formatter, dan helper
└── server/
    ├── reports/            # perhitungan laporan
    ├── services/           # business logic COA, jurnal, persediaan, auth
    └── validators.ts       # validasi input dengan Zod
prisma/
├── schema.prisma           # schema database
├── migrations/             # migration PostgreSQL
└── seed.ts                 # data awal development
```

## Model data utama

- `CoaAccount` — master akun dan hierarki COA.
- `CoaEntry` — saldo akun per periode.
- `JournalTransaction` — transaksi jurnal hasil import atau input.
- `InventoryItem` — master barang persediaan.
- `AccountingPeriod` — periode dan status buka/tutup.
- `AuditLog` — jejak perubahan data.
- `User` — pengguna dan role akses.

## Pemeriksaan sebelum commit

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Jangan commit file `.env`, credential database, password admin, atau `AUTH_SECRET`. Untuk production, gunakan secret acak dan database dengan backup rutin.
