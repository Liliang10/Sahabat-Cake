import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app, { startServer } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4001; // Port khusus testing
let server;
let adminToken = '';
let createdProductId = null;
let createdGalleryId = null;
let createdOrderId = null;
let customOrderId = null;

const request = async (urlPath, { method = 'GET', headers = {}, body = null } = {}) => {
  const url = `http://localhost:${PORT}${urlPath}`;
  const options = { method, headers: { ...headers } };

  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  } else if (body) {
    options.body = body;
  }

  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (_) {}
  return { status: res.status, headers: res.headers, text, json };
};

const runTests = async () => {
  console.log('🚀 Memulai Pengujian API SAHABAT CAKE...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const r1 = await request('/api/health');
    assert(r1.status === 200 && r1.json?.status === 'ok', 'GET /api/health');

    // 2. Get Products (Public)
    const r2 = await request('/api/products');
    assert(r2.status === 200 && Array.isArray(r2.json) && r2.json.length >= 8, 'GET /api/products (semua produk)');

    // 3. Filter Products by Category
    const r3Tart = await request('/api/products?category=tart');
    const r3Basah = await request('/api/products?category=kue-basah');
    assert(
      r3Tart.status === 200 && r3Tart.json.every((p) => p.category === 'tart'),
      'GET /api/products?category=tart'
    );
    assert(
      r3Basah.status === 200 && r3Basah.json.every((p) => p.category === 'kue-basah'),
      'GET /api/products?category=kue-basah'
    );

    // 4. Get Product Detail
    const r4 = await request('/api/products/1');
    assert(r4.status === 200 && r4.json?.id === 1 && r4.json?.name === 'Blue Garden', 'GET /api/products/1');

    // 5. Get Gallery
    const r5 = await request('/api/gallery');
    assert(r5.status === 200 && Array.isArray(r5.json) && r5.json.length >= 6, 'GET /api/gallery');

    // 6. Get Settings
    const r6 = await request('/api/settings');
    assert(r6.status === 200 && r6.json?.waTemplate && r6.json?.whatsapp !== undefined, 'GET /api/settings');

    // 7. Order from Catalog
    const r7 = await request('/api/orders', {
      method: 'POST',
      body: {
        nama: 'Budi Santoso',
        productId: 1,
        jumlah: 2,
        tanggal: '2026-12-01',
      },
    });
    assert(
      r7.status === 201 && r7.json?.id?.startsWith('SC-') && r7.json?.status === 'menunggu',
      'POST /api/orders (pesanan katalog)',
      `status=${r7.status}, id=${r7.json?.id}`
    );
    createdOrderId = r7.json?.id;

    // 8. Custom Tart Request (URL-encoded / JSON simulation)
    const formDataCustom = new FormData();
    formDataCustom.append('nama', 'Citra Lestari');
    formDataCustom.append('tema', 'Rustic Floral');
    formDataCustom.append('warna', 'Pink & Krem');
    formDataCustom.append('ukuran', 'Ø 18 cm');
    formDataCustom.append('rasa', 'Red velvet');
    formDataCustom.append('tulisan', 'Happy Anniversary');
    formDataCustom.append('jumlah', '1');
    formDataCustom.append('tanggal', '2026-12-05');
    formDataCustom.append('catatan', 'Tolong hiasan bunga minimalis');

    const resCustom = await fetch(`http://localhost:${PORT}/api/custom-requests`, {
      method: 'POST',
      body: formDataCustom,
    });
    const jsonCustom = await resCustom.json();
    assert(
      resCustom.status === 201 && jsonCustom.id?.startsWith('SC-') && jsonCustom.status === 'menunggu',
      'POST /api/custom-requests (tanpa file gambar)',
      `status=${resCustom.status}`
    );
    customOrderId = jsonCustom.id;

    // 9. Admin Login - gagal password salah
    const r9Fail = await request('/api/admin/login', {
      method: 'POST',
      body: { password: 'wrongpassword' },
    });
    assert(r9Fail.status === 401, 'POST /api/admin/login (password salah ditolak)');

    // 10. Admin Login - sukses via password saja (kompatibel frontend)
    const r10Pass = await request('/api/admin/login', {
      method: 'POST',
      body: { password: 'sahabat123' },
    });
    assert(
      r10Pass.status === 200 && !!r10Pass.json?.token,
      'POST /api/admin/login (password saja - kecocokan frontend)'
    );
    adminToken = r10Pass.json?.token;

    // 11. Admin Login - sukses via username & password
    const r11User = await request('/api/admin/login', {
      method: 'POST',
      body: { username: 'admin', password: 'sahabat123' },
    });
    assert(r11User.status === 200 && !!r11User.json?.token, 'POST /api/admin/login (username & password)');

    // 12. Admin Login - sukses via email & password
    const r12Email = await request('/api/admin/login', {
      method: 'POST',
      body: { email: 'admin@sahabatcake.com', password: 'sahabat123' },
    });
    assert(r12Email.status === 200 && !!r12Email.json?.token, 'POST /api/admin/login (email & password)');

    // 13. Proteksi Endpoint Admin tanpa Token
    const r13NoAuth = await request('/api/admin/summary');
    assert(r13NoAuth.status === 401, 'GET /api/admin/summary (tanpa token -> 401)');

    // 14. Admin Verify & Me
    const r14Me = await request('/api/admin/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(r14Me.status === 200 && r14Me.json?.admin?.username === 'admin', 'GET /api/admin/me');

    // 15. Admin Summary Dashboard
    const r15Summary = await request('/api/admin/summary', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      r15Summary.status === 200 &&
        typeof r15Summary.json?.products === 'number' &&
        typeof r15Summary.json?.orders === 'number' &&
        typeof r15Summary.json?.waiting === 'number' &&
        typeof r15Summary.json?.stockBasah === 'number' &&
        Array.isArray(r15Summary.json?.perDay) &&
        r15Summary.json?.composition &&
        Array.isArray(r15Summary.json?.latest),
      'GET /api/admin/summary (data statistik dashboard lengkap)'
    );

    // 16. Admin Get Orders
    const r16Orders = await request('/api/admin/orders', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(r16Orders.status === 200 && Array.isArray(r16Orders.json), 'GET /api/admin/orders');

    // 17. Admin Update Order (konfirmasi & harga final)
    const r17Update = await request(`/api/admin/orders/${customOrderId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'dikonfirmasi',
        finalPrice: 350000,
      },
    });
    assert(
      r17Update.status === 200 &&
        r17Update.json?.status === 'dikonfirmasi' &&
        Number(r17Update.json?.finalPrice) === 350000,
      'PATCH /api/admin/orders/:id (update status & final price)'
    );

    // 18. Admin Tambah Produk Baru
    const formProduct = new FormData();
    formProduct.append('name', 'Pandan Chiffon Gold');
    formProduct.append('category', 'tart');
    formProduct.append('price', '175000');
    formProduct.append('stock', 'Pre-order');
    formProduct.append('size', 'Ø 20 cm');
    formProduct.append('flavor', 'Pandan Asli');
    formProduct.append('description', 'Chiffon lembut beraroma pandan suji.');

    const resProd = await fetch(`http://localhost:${PORT}/api/admin/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formProduct,
    });
    const jsonProd = await resProd.json();
    assert(resProd.status === 201 && jsonProd.name === 'Pandan Chiffon Gold', 'POST /api/admin/products (tambah produk)');
    createdProductId = jsonProd.id;

    // 19. Admin Update Produk
    const formUpdateProd = new FormData();
    formUpdateProd.append('name', 'Pandan Chiffon Premium');
    formUpdateProd.append('category', 'tart');
    formUpdateProd.append('price', '195000');
    formUpdateProd.append('stock', 'Pre-order');
    formUpdateProd.append('size', 'Ø 20 cm');
    formUpdateProd.append('flavor', 'Pandan & Kelapa Muda');
    formUpdateProd.append('description', 'Chiffon lembut dengan topping kelapa muda.');

    const resUpdateProd = await fetch(`http://localhost:${PORT}/api/admin/products/${createdProductId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formUpdateProd,
    });
    const jsonUpdateProd = await resUpdateProd.json();
    assert(
      resUpdateProd.status === 200 && jsonUpdateProd.name === 'Pandan Chiffon Premium',
      'PUT /api/admin/products/:id (update produk)'
    );

    // 20. Admin Hapus Produk
    const r20Del = await request(`/api/admin/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(r20Del.status === 204, 'DELETE /api/admin/products/:id (hapus produk)');

    // 21. Admin Update Settings
    const r21Set = await request('/api/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        whatsapp: '628987654321',
        instagram: '@sahabatcakenew',
        facebook: 'Sahabat Cake',
        address: 'Jl. Surya Kencana No. 45',
        hours: 'Senin–Minggu 08.00–20.00',
      },
    });
    assert(
      r21Set.status === 200 && r21Set.json?.whatsapp === '628987654321',
      'PUT /api/admin/settings (update pengaturan)'
    );

    // 22. Admin Tambah Foto Galeri (Buat file dummy kecil)
    const dummyImagePath = path.join(__dirname, 'uploads', 'test-temp.png');
    const dummyPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(dummyImagePath, dummyPngBuffer);

    const formGal = new FormData();
    formGal.append('title', 'Karya Uji Coba');
    formGal.append('caption', 'Foto tes otomatis');
    formGal.append('group', 'tart');
    const blob = new Blob([dummyPngBuffer], { type: 'image/png' });
    formGal.append('image', blob, 'test-temp.png');

    const resGal = await fetch(`http://localhost:${PORT}/api/admin/gallery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formGal,
    });
    const jsonGal = await resGal.json();
    assert(resGal.status === 201 && jsonGal.title === 'Karya Uji Coba', 'POST /api/admin/gallery (upload foto)');
    createdGalleryId = jsonGal.id;

    // Bersihkan file sementara
    if (fs.existsSync(dummyImagePath)) {
      try {
        fs.unlinkSync(dummyImagePath);
      } catch (_) {}
    }

    // 23. Admin Hapus Foto Galeri
    const r23DelGal = await request(`/api/admin/gallery/${createdGalleryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(r23DelGal.status === 204, 'DELETE /api/admin/gallery/:id (hapus galeri)');

    // 24. Admin Logout
    const r24Logout = await request('/api/admin/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(r24Logout.status === 200, 'POST /api/admin/logout');

    console.log(`\n========================================`);
    console.log(`Hasil Pengujian: ${passed} PASS, ${failed} FAIL`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Error pengujian tak terduga:', err);
    process.exit(1);
  }
};

server = await startServer(PORT);
await runTests();
server.close();
