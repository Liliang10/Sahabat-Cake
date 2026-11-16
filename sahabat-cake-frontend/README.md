# SAHABAT CAKE — React JS + Express JS

Website tart & kue basah dengan pemesanan via WhatsApp, lengkap dengan panel admin.

## Struktur
```
sahabat-cake/
├── client/   React (Vite) — semua halaman publik + admin
└── server/   Express — REST API, upload foto, data tersimpan di data/db.json
    └── uploads/   foto produk (sudah berisi foto dari desain)
```

## Menjalankan
Butuh Node.js 18+.
```bash
npm run install:all     # pasang dependensi root, server, dan client
npm run dev             # API di :4000, web di http://localhost:5173
```
Vite meneruskan `/api` dan `/uploads` ke Express, jadi frontend dan backend langsung tersambung.

Admin: buka `http://localhost:5173/admin` (atau tautan "Admin" di footer).
Kata sandi bawaan `sahabat123` — ganti lewat variabel lingkungan `ADMIN_PASSWORD` sebelum dipakai sungguhan.

## Halaman
| Rute | Isi |
|---|---|
| `/` | Beranda |
| `/tentang-kami` | Tentang kami |
| `/katalog-tart`, `/kue-basah` | Katalog + modal detail/pesan |
| `/custom-tart` | Form custom + preview pesan WhatsApp + upload referensi |
| `/galeri-kontak` | Galeri (filter) + kontak |
| `/admin` | Ringkasan, `/admin/produk` kelola produk, `/admin/pengaturan` pesanan, galeri, info usaha, template WA |

## Alur data
- Nomor WhatsApp, alamat, Instagram, dsb. diisi di **Admin → Pengaturan → Informasi usaha**. Selama kosong, tombol WhatsApp tidak membuka chat, tetapi pesanan dan permintaan tetap tersimpan.
- Pesanan katalog dan permintaan custom tersimpan di `server/data/db.json` dengan status *menunggu*; admin menandainya *dikonfirmasi* atau *ditolak*. Tidak ada notifikasi otomatis.
- Hapus `server/data/db.json` untuk mengembalikan data contoh.

## Produksi
`npm run build` lalu sajikan `client/dist` dari web server Anda dengan proxy `/api` dan `/uploads` ke Express. Untuk trafik nyata, ganti `db.json` dengan database (SQLite/PostgreSQL) dan token admin dengan sesi yang aman.
