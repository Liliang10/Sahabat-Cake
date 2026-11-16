import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { openDb } from '../src/db.js';
import { createServices } from '../src/services.js';
import { createAuth, loadSecret } from '../src/auth.js';
import { createLimiter } from '../src/ratelimit.js';
import { looksLikeImage } from '../src/imageCheck.js';
import { HttpError } from '../src/errors.js';

const tomorrow = () => new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10);
function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-'));
  const db = openDb(':memory:');
  return { db, dir, s: createServices({ db, uploadDir: dir }) };
}
const throwsHttp = (fn, status, re) =>
  assert.throws(fn, (e) => e instanceof HttpError && e.status === status && (!re || re.test(e.message)));

test('seed: produk, galeri, pengaturan & urutan pesanan terbaru dulu', () => {
  const { s } = setup();
  assert.equal(s.listProducts().length, 8);
  assert.equal(s.listProducts('tart').length, 4);
  assert.equal(s.listGallery().length, 6);
  assert.equal(s.getSettings().waTemplate.startsWith('Halo SAHABAT CAKE'), true);
  const o = s.listOrders();
  assert.equal(o.length, 12);
  assert.equal(o[0].id, 'SC-012');
  assert.equal(o[0].detail.tema, 'Floral Garden');
  assert.equal(typeof s.getProduct(5).stock, 'number');
  assert.equal(s.getProduct(1).stock, 'Pre-order');
});

test('ringkasan cocok dengan data contoh', () => {
  const { s } = setup();
  const r = s.summary();
  assert.deepEqual([r.products, r.tart, r.kueBasah, r.orders], [8, 4, 4, 12]);
  assert.equal(r.waiting, 3);
  assert.equal(r.confirmed, 9);
  assert.equal(r.customWaiting, 3);
  assert.equal(r.stockBasah, 126);
  assert.deepEqual(r.composition, { tart: 4, kueBasah: 5, custom: 3 });
  assert.equal(r.perDay.length, 6);
  assert.deepEqual(r.perDay.map((d) => d.date), [...r.perDay.map((d) => d.date)].sort());
  assert.equal(r.latest.length, 5);
});

test('pesanan katalog: id berurutan, validasi, stok', () => {
  const { s } = setup();
  const o = s.createOrder({ nama: ' Budi ', productId: '1', jumlah: '2', tanggal: tomorrow() });
  assert.equal(o.id, 'SC-013');
  assert.equal(o.item, 'Blue Garden · 2 kue');
  assert.equal(o.status, 'menunggu');
  throwsHttp(() => s.createOrder({ nama: '', productId: 1, jumlah: 1, tanggal: tomorrow() }), 400, /Nama/);
  throwsHttp(() => s.createOrder({ nama: 'A', productId: 999, jumlah: 1, tanggal: tomorrow() }), 404);
  throwsHttp(() => s.createOrder({ nama: 'A', productId: 1, jumlah: 0, tanggal: tomorrow() }), 400, /Jumlah/);
  throwsHttp(() => s.createOrder({ nama: 'A', productId: 1, jumlah: 1, tanggal: '2020-01-01' }), 400, /masa lalu/);
  throwsHttp(() => s.createOrder({ nama: 'A', productId: 1, jumlah: 1, tanggal: '2026-02-31' }), 400, /tidak valid/);
  throwsHttp(() => s.createOrder({ nama: 'A', productId: 5, jumlah: 41, tanggal: tomorrow() }), 409, /tersisa 40/);
});

test('stok kue basah dipotong saat konfirmasi & dikembalikan saat dibatalkan', () => {
  const { s } = setup();
  const o = s.createOrder({ nama: 'A', productId: 5, jumlah: 10, tanggal: tomorrow() });
  assert.equal(s.getProduct(5).stock, 40);
  s.updateOrder(o.id, { status: 'dikonfirmasi' });
  assert.equal(s.getProduct(5).stock, 30);
  s.updateOrder(o.id, { status: 'dikonfirmasi', finalPrice: '35000' }); // idempoten
  assert.equal(s.getProduct(5).stock, 30);
  s.updateOrder(o.id, { status: 'ditolak' });
  assert.equal(s.getProduct(5).stock, 40);
  // stok habis oleh pesanan lain sebelum konfirmasi
  const a = s.createOrder({ nama: 'A', productId: 6, jumlah: 25, tanggal: tomorrow() });
  const b = s.createOrder({ nama: 'B', productId: 6, jumlah: 25, tanggal: tomorrow() });
  s.updateOrder(a.id, { status: 'dikonfirmasi' });
  throwsHttp(() => s.updateOrder(b.id, { status: 'dikonfirmasi' }), 409, /tidak cukup/);
  assert.equal(s.getProduct(6).stock, 5);
  assert.equal(s.listOrders().find((x) => x.id === b.id).status, 'menunggu'); // rollback utuh
});

test('update pesanan: status tidak valid & harga final bebas ketik', () => {
  const { s } = setup();
  throwsHttp(() => s.updateOrder('SC-012', { status: 'selesai' }), 400, /Status/);
  throwsHttp(() => s.updateOrder('SC-999', { status: 'ditolak' }), 404);
  const r = s.updateOrder('SC-012', { status: 'dikonfirmasi', finalPrice: 'Rp 350.000' });
  assert.equal(r.finalPrice, 350000);
  assert.equal(s.updateOrder('SC-012', { status: 'dikonfirmasi', finalPrice: '' }).finalPrice, undefined);
  throwsHttp(() => s.updateOrder('SC-012', { finalPrice: 'abc' }), 400);
});

test('custom request: validasi, normalisasi jumlah, simpan referensi', () => {
  const { s } = setup();
  const body = { nama: 'Nadia', tema: 'Ocean', warna: 'Pink pastel', ukuran: 'Ø 16 cm', rasa: 'Vanila', tulisan: 'Hai', jumlah: '1', tanggal: tomorrow() };
  const r = s.createCustomRequest(body, 'ref.jpg');
  assert.equal(r.status, 'menunggu');
  const o = s.listOrders().find((x) => x.id === r.id);
  assert.equal(o.type, 'custom');
  assert.equal(o.detail.jumlah, '1 kue');
  assert.equal(o.detail.referensi, 'ref.jpg');
  assert.equal(o.detail.catatan, '-');
  throwsHttp(() => s.createCustomRequest({ ...body, tulisan: '' }), 400, /Tulisan/);
});

test('file referensi dihapus bila permintaan custom ditolak validasi', () => {
  const { s, dir } = setup();
  const f = path.join(dir, 'x.jpg');
  fs.writeFileSync(f, 'x');
  assert.throws(() => s.createCustomRequest({ nama: 'A' }, 'x.jpg'));
  assert.equal(fs.existsSync(f), false);
});

test('produk: CRUD, kategori menentukan unit/stok, file lama dibersihkan', () => {
  const { s, dir } = setup();
  fs.writeFileSync(path.join(dir, 'a.jpg'), 'a');
  fs.writeFileSync(path.join(dir, 'b.jpg'), 'b');
  const p = s.createProduct({ name: 'Onde-onde', category: 'kue-basah', price: '3000', stock: '12' }, 'a.jpg');
  assert.equal(p.unit, 'buah');
  assert.equal(p.stock, 12);
  const t = s.createProduct({ name: 'Tart Baru', category: 'tart', price: 200000 });
  assert.equal(t.stock, 'Pre-order');
  assert.equal(t.unit, 'kue');
  const u = s.updateProduct(p.id, { name: 'Onde Ongde', category: 'kue-basah', price: 3500, stock: 9 }, 'b.jpg');
  assert.equal(u.image, 'b.jpg');
  assert.equal(fs.existsSync(path.join(dir, 'a.jpg')), false); // gambar lama dihapus
  const keep = s.updateProduct(p.id, { name: 'Onde', category: 'kue-basah', price: 3500, stock: 9 });
  assert.equal(keep.image, 'b.jpg');
  throwsHttp(() => s.createProduct({ name: '', category: 'tart', price: 1 }), 400, /Nama/);
  throwsHttp(() => s.createProduct({ name: 'x', category: 'roti', price: 1 }), 400, /Kategori/);
  throwsHttp(() => s.createProduct({ name: 'x', category: 'tart', price: -5 }), 400, /Harga/);
  throwsHttp(() => s.updateProduct(9999, { name: 'x', category: 'tart', price: 1 }), 404);
  s.deleteProduct(p.id);
  assert.equal(fs.existsSync(path.join(dir, 'b.jpg')), false);
  throwsHttp(() => s.getProduct(p.id), 404);
  s.deleteProduct(p.id); // idempoten
});

test('gambar yang dipakai bersama (produk & galeri) tidak ikut terhapus', () => {
  const { s, dir } = setup();
  fs.writeFileSync(path.join(dir, 'blue-garden.jpg'), 'x');
  s.deleteProduct(1); // masih dipakai galeri #1
  assert.equal(fs.existsSync(path.join(dir, 'blue-garden.jpg')), true);
  s.deleteGallery(1);
  assert.equal(fs.existsSync(path.join(dir, 'blue-garden.jpg')), false);
});

test('pengaturan: hanya kunci yang diizinkan & validasi nomor WhatsApp', () => {
  const { s } = setup();
  const r = s.updateSettings({ whatsapp: '6281234567890', instagram: '@sahabatcake', hack: 'x' });
  assert.equal(r.whatsapp, '6281234567890');
  assert.equal(r.hack, undefined);
  throwsHttp(() => s.updateSettings({ whatsapp: 'abc' }), 400, /WhatsApp/);
  assert.equal(s.updateSettings({ address: 'Jl. Mawar 1' }).whatsapp, '6281234567890'); // tidak menimpa yang lain
});

test('galeri: foto wajib, grup dinormalisasi', () => {
  const { s } = setup();
  throwsHttp(() => s.addGallery({ title: 'x' }), 400, /Foto/);
  const g = s.addGallery({ title: '', group: 'apa-saja' }, 'g.jpg');
  assert.deepEqual([g.title, g.group], ['Karya baru', 'tart']);
});

test('impor data prototipe db.json saat database baru', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-'));
  const legacy = path.join(dir, 'db.json');
  fs.writeFileSync(legacy, JSON.stringify({
    settings: { whatsapp: '62811', instagram: '', facebook: '', address: '', hours: '', waTemplate: 'T' },
    products: [{ id: 7, name: 'Lama', category: 'tart', price: 1, unit: 'kue', stock: 'Pre-order', image: '' }],
    orders: [
      { id: 'SC-002', customer: 'B', item: 'i', type: 'tart', date: '2026-01-02', status: 'menunggu', finalPrice: '5000' },
      { id: 'SC-001', customer: 'A', item: 'i', type: 'tart', date: '2026-01-01', status: 'dikonfirmasi' },
    ],
    gallery: [],
  }));
  const s = createServices({ db: openDb(':memory:', { legacyJson: legacy }), uploadDir: dir });
  assert.equal(s.getProduct(7).name, 'Lama');
  assert.deepEqual(s.listOrders().map((o) => o.id), ['SC-002', 'SC-001']);
  assert.equal(s.listOrders()[0].finalPrice, 5000);
  assert.equal(s.getSettings().whatsapp, '62811');
});

test('auth: token sah, kedaluwarsa, dirusak, dan dicabut saat kata sandi berganti', () => {
  let t = 1_000_000;
  const mk = (password) => createAuth({ password, secret: 's3cret', ttlMs: 1000, now: () => t });
  const a = mk('rahasia');
  assert.equal(a.checkPassword('rahasia'), true);
  assert.equal(a.checkPassword('salah'), false);
  assert.equal(a.checkPassword(undefined), false);
  const tok = a.issue();
  assert.equal(a.verify(tok), true);
  assert.equal(a.verify(tok.slice(0, -2) + 'xx'), false);
  assert.equal(a.verify(tok + '.x'), false);
  assert.equal(a.verify(''), false);
  assert.equal(a.verify(undefined), false);
  assert.equal(mk('baru').verify(tok), false);
  t += 1001;
  assert.equal(a.verify(tok), false);
});

test('secret token dibuat sekali lalu dipakai ulang', () => {
  const db = openDb(':memory:');
  const s1 = loadSecret(db, '');
  assert.equal(loadSecret(db, ''), s1);
  assert.equal(loadSecret(db, 'dari-env'), 'dari-env');
});

test('pembatas permintaan', () => {
  let t = 0;
  const l = createLimiter({ windowMs: 1000, max: 2, now: () => t });
  assert.equal(l.consume('ip').ok, true);
  assert.equal(l.consume('ip').ok, true);
  const r = l.consume('ip');
  assert.equal(r.ok, false);
  assert.equal(r.retryAfter, 1);
  assert.equal(l.consume('lain').ok, true);
  l.reset('ip');
  assert.equal(l.consume('ip').ok, true);
  t = 5000;
  assert.equal(l.consume('lain').ok, true);
});

test('deteksi gambar lewat magic bytes', () => {
  assert.equal(looksLikeImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])), true);
  assert.equal(looksLikeImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), true);
  assert.equal(looksLikeImage(Buffer.from('<?php echo 1; ?>')), false);
  assert.equal(looksLikeImage(Buffer.alloc(8)), false);
});
