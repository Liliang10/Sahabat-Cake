# SAHABAT CAKE — React JS + Express JS

Website tart & kue basah dengan pemesanan via WhatsApp, lengkap dengan panel admin.

## Struktur
```
sahabat-cake/
├── client/   React (Vite) — semua halaman publik + admin
└── server/   Express — REST API, upload foto, data tersimpan di SQLite (server/data/sahabat.sqlite)
    └── uploads/   foto produk (sudah berisi foto dari desain)
```

## Menjalankan
Butuh Node.js 22.9+ (SQLite bawaan Node, tanpa dependensi native).
```bash
npm run install:all     # pasang dependensi root, server, dan client
npm run dev             # API di :4001, web di http://localhost:5173
```
Vite meneruskan `/api` dan `/uploads` ke Express, jadi frontend dan backend langsung tersambung.

Admin: buka `http://localhost:5173/admin` (atau tautan "Admin" di footer).
Kata sandi bawaan (hanya mode pengembangan) `sahabat123`. Salin `server/.env.example` menjadi `server/.env` dan isi `ADMIN_PASSWORD`; di produksi (`NODE_ENV=production`) server menolak start tanpa kata sandi sendiri.

## Halaman
| Rute | Isi |
|---|---|
| `/` | Beranda |
| `/tentang-kami` | Tentang kami |
| `/katalog-tart`, `/kue-basah` | Katalog + modal detail/pesan |
| `/custom-tart` | Form custom + preview pesan WhatsApp + upload referensi |
| `/galeri-kontak` | Galeri (filter) + kontak |
| `/admin` | Ringkasan, `/admin/produk` kelola produk, `/admin/pengaturan` pesanan, galeri, info usaha, template WA |

## Backend (server/)
```
server/
├── index.js            titik masuk (rakit modul, jalankan server)
├── src/
│   ├── app.js          rute Express + penanganan galat
│   ├── services.js     logika bisnis (pesanan, stok, produk, galeri, pengaturan)
│   ├── db.js           skema SQLite, seed, impor db.json lama
│   ├── auth.js         token admin bertanda tangan HMAC + kedaluwarsa
│   ├── validate.js     validasi input    ratelimit.js  pembatas permintaan
│   └── uploads.js      multer + cek isi file JPG/PNG
├── data/seed.js        data contoh      test/  tes otomatis (npm --prefix server test)
```

### Endpoint
| Metode | Rute | Keterangan |
|---|---|---|
| GET | `/api/products?category=tart\|kue-basah`, `/api/products/:id` | Katalog |
| GET | `/api/gallery`, `/api/settings` | Galeri, info usaha |
| POST | `/api/orders` | Pesanan katalog `{nama, productId, jumlah, tanggal}` (cek stok kue basah) |
| POST | `/api/custom-requests` | Form custom (multipart, foto `referensi` opsional) |
| POST | `/api/admin/login` | `{password}` → `{token}` (maks. 10 percobaan / 15 menit / IP) |
| GET | `/api/admin/summary`, `/api/admin/orders` | Ringkasan, daftar pesanan |
| PATCH | `/api/admin/orders/:id` | `{status, finalPrice}` |
| POST/PUT/DELETE | `/api/admin/products[/:id]` | Kelola produk (multipart, foto `image`) |
| PUT | `/api/admin/settings` | Info usaha & template WA |
| POST/DELETE | `/api/admin/gallery[/:id]` | Kelola galeri |
| GET | `/api/health` | Cek hidup |

Perilaku penting:
- **Stok kue basah** dikurangi saat pesanan *dikonfirmasi* dan dikembalikan bila konfirmasi dibatalkan/ditolak. Pesanan melebihi stok ditolak (409).
- Token admin berlaku 12 jam (`TOKEN_TTL_HOURS`); mengganti `ADMIN_PASSWORD` mencabut semua sesi.
- Foto divalidasi dari isi berkas (JPG/PNG sungguhan, maks. 5 MB), diberi nama acak, dan foto lama dihapus saat diganti/dihapus (kecuali masih dipakai tempat lain).
- Tanggal harus valid dan tidak di masa lalu; semua teks dibatasi panjangnya.

## Alur data
- Nomor WhatsApp, alamat, Instagram, dsb. diisi di **Admin → Pengaturan → Informasi usaha**. Selama kosong, tombol WhatsApp tidak membuka chat, tetapi pesanan dan permintaan tetap tersimpan.
- Pesanan katalog dan permintaan custom tersimpan di SQLite dengan status *menunggu*; admin menandainya *dikonfirmasi* atau *ditolak*. Tidak ada notifikasi otomatis.
- Pernah menjalankan versi lama? `server/data/db.json` otomatis diimpor sekali saat database baru dibuat.
- Untuk mengembalikan data contoh, hentikan server lalu hapus `server/data/sahabat.sqlite*`.
- Cadangan: salin file `sahabat.sqlite` (dan folder `server/uploads/`) saat server berhenti.

## Produksi
```bash
npm run build
NODE_ENV=production ADMIN_PASSWORD=... npm start   # Express juga menyajikan client/dist
```
Di belakang Nginx/Cloudflare, setel `TRUST_PROXY=1` agar pembatas percobaan login memakai IP klien yang benar, dan pasang HTTPS. Satu proses Node saja (pembatas & SQLite berada di proses ini).
