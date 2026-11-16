import fs from 'fs';
import path from 'path';
import { transaction } from './db.js';
import { HttpError, bad } from './errors.js';
import { text, integer, rupiah, isoDate, oneOf } from './validate.js';

const CATEGORIES = ['tart', 'kue-basah'];
const STATUSES = ['menunggu', 'dikonfirmasi', 'ditolak'];
const SETTING_KEYS = ['whatsapp', 'instagram', 'facebook', 'address', 'hours', 'waTemplate'];
const SETTING_MAX = { whatsapp: 25, instagram: 100, facebook: 200, address: 300, hours: 200, waTemplate: 1000 };

const toProduct = (r) => ({
  id: r.id, name: r.name, category: r.category, price: r.price, unit: r.unit,
  stock: r.category === 'kue-basah' ? Number(r.stock) || 0 : r.stock,
  size: r.size, flavor: r.flavor, image: r.image, description: r.description,
});
const toGallery = (r) => ({ id: r.id, title: r.title, caption: r.caption, group: r.grp, image: r.image });
const toOrder = (r) => {
  const o = { id: r.id, customer: r.customer, item: r.item, type: r.type, date: r.date, status: r.status };
  if (r.detail) o.detail = JSON.parse(r.detail);
  if (r.final_price != null) o.finalPrice = r.final_price;
  return o;
};

export function createServices({ db, uploadDir }) {
  const q = (sql) => db.prepare(sql);

  /* ---------- berkas ---------- */
  function removeFileIfUnused(name) {
    if (!name || name !== path.basename(name)) return;
    const used =
      q('SELECT 1 FROM products WHERE image = ?').get(name) ||
      q('SELECT 1 FROM gallery WHERE image = ?').get(name) ||
      q("SELECT 1 FROM orders WHERE type = 'custom' AND detail LIKE ?").get(`%"${name}"%`);
    if (!used) fs.rmSync(path.join(uploadDir, name), { force: true });
  }

  /* ---------- publik ---------- */
  const listProducts = (category) =>
    (category
      ? q('SELECT * FROM products WHERE category = ? ORDER BY id').all(category)
      : q('SELECT * FROM products ORDER BY id').all()).map(toProduct);

  function getProduct(id) {
    const r = q('SELECT * FROM products WHERE id = ?').get(Number(id));
    if (!r) throw new HttpError(404, 'Produk tidak ditemukan');
    return toProduct(r);
  }

  const listGallery = () => q('SELECT * FROM gallery ORDER BY id').all().map(toGallery);

  function getSettings() {
    const out = Object.fromEntries(SETTING_KEYS.map((k) => [k, '']));
    for (const r of q('SELECT key, value FROM settings').all()) out[r.key] = r.value;
    return out;
  }

  const nextOrderId = () => {
    const r = q("SELECT MAX(CAST(SUBSTR(id, 4) AS INTEGER)) AS n FROM orders").get();
    return 'SC-' + String((r.n || 0) + 1).padStart(3, '0');
  };
  const insertOrder = (o) => {
    const id = nextOrderId();
    q(`INSERT INTO orders (id, customer, item, type, date, status, detail, product_id, qty)
       VALUES (?,?,?,?,?,'menunggu',?,?,?)`)
      .run(id, o.customer, o.item, o.type, o.date, o.detail ? JSON.stringify(o.detail) : null, o.productId ?? null, o.qty ?? null);
    return toOrder(q('SELECT * FROM orders WHERE id = ?').get(id));
  };

  function createCustomRequest(body, referensi) {
    try {
      const b = body || {};
      const nama = text(b.nama, 'Nama', { required: true, max: 100 });
      const tema = text(b.tema, 'Tema', { required: true, max: 100 });
      const detail = {
        tema,
        warna: text(b.warna, 'Warna', { required: true, max: 100 }),
        ukuran: text(b.ukuran, 'Ukuran', { required: true, max: 50 }),
        rasa: text(b.rasa, 'Rasa', { required: true, max: 50 }),
        jumlah: `${integer(b.jumlah, 'Jumlah', { min: 1, max: 50 })} kue`,
        tulisan: text(b.tulisan, 'Tulisan', { required: true, max: 120 }),
        catatan: text(b.catatan, 'Catatan', { max: 1000 }) || '-',
        referensi: referensi || null,
      };
      const date = isoDate(b.tanggal, 'Tanggal');
      const o = transaction(db, () => insertOrder({ customer: nama, item: `Custom Tart · ${tema}`, type: 'custom', date, detail }));
      return { id: o.id, status: o.status };
    } catch (e) {
      removeFileIfUnused(referensi);
      throw e;
    }
  }

  function createOrder(body) {
    const b = body || {};
    const nama = text(b.nama, 'Nama', { required: true, max: 100 });
    const qty = integer(b.jumlah, 'Jumlah', { min: 1, max: 999 });
    const date = isoDate(b.tanggal, 'Tanggal');
    const row = q('SELECT * FROM products WHERE id = ?').get(Number(b.productId));
    if (!row) throw new HttpError(404, 'Produk tidak ditemukan');
    if (row.category === 'kue-basah' && qty > (Number(row.stock) || 0))
      throw new HttpError(409, `Stok ${row.name} tersisa ${Number(row.stock) || 0} ${row.unit}`);
    return transaction(db, () =>
      insertOrder({ customer: nama, item: `${row.name} · ${qty} ${row.unit}`, type: row.category, date, productId: row.id, qty }));
  }

  /* ---------- admin: ringkasan & pesanan ---------- */
  function summary() {
    const n = (sql, ...a) => q(sql).get(...a).n;
    const perDay = q(`SELECT date, COUNT(*) AS count FROM orders
                      GROUP BY date ORDER BY date DESC LIMIT 6`).all().reverse();
    const byType = (t) => n('SELECT COUNT(*) AS n FROM orders WHERE type = ?', t);
    return {
      products: n('SELECT COUNT(*) AS n FROM products'),
      tart: n("SELECT COUNT(*) AS n FROM products WHERE category = 'tart'"),
      kueBasah: n("SELECT COUNT(*) AS n FROM products WHERE category = 'kue-basah'"),
      orders: n('SELECT COUNT(*) AS n FROM orders'),
      confirmed: n("SELECT COUNT(*) AS n FROM orders WHERE status = 'dikonfirmasi'"),
      waiting: n("SELECT COUNT(*) AS n FROM orders WHERE status = 'menunggu'"),
      customWaiting: n("SELECT COUNT(*) AS n FROM orders WHERE type = 'custom' AND status = 'menunggu'"),
      stockBasah: n("SELECT COALESCE(SUM(CAST(stock AS INTEGER)), 0) AS n FROM products WHERE category = 'kue-basah'"),
      perDay,
      composition: { tart: byType('tart'), kueBasah: byType('kue-basah'), custom: byType('custom') },
      latest: q('SELECT * FROM orders ORDER BY seq DESC LIMIT 5').all().map(toOrder),
    };
  }

  const listOrders = () => q('SELECT * FROM orders ORDER BY seq DESC').all().map(toOrder);

  function updateOrder(id, body) {
    const b = body || {};
    return transaction(db, () => {
      const o = q('SELECT * FROM orders WHERE id = ?').get(id);
      if (!o) throw new HttpError(404, 'Pesanan tidak ditemukan');

      const status = b.status === undefined ? o.status : oneOf(b.status, STATUSES, 'Status');
      const finalPrice = b.finalPrice === undefined ? o.final_price : rupiah(b.finalPrice, 'Harga final');

      // Stok kue basah dipotong saat dikonfirmasi dan dikembalikan bila konfirmasi dibatalkan
      if (o.product_id && o.qty && o.type === 'kue-basah') {
        const was = o.status === 'dikonfirmasi';
        const will = status === 'dikonfirmasi';
        const p = q('SELECT * FROM products WHERE id = ?').get(o.product_id);
        if (p && p.category === 'kue-basah' && was !== will) {
          const stock = Number(p.stock) || 0;
          if (will && stock < o.qty) throw new HttpError(409, `Stok ${p.name} tidak cukup (tersisa ${stock})`);
          q('UPDATE products SET stock = ? WHERE id = ?').run(String(will ? stock - o.qty : stock + o.qty), p.id);
        }
      }
      q('UPDATE orders SET status = ?, final_price = ? WHERE id = ?').run(status, finalPrice, id);
      return toOrder(q('SELECT * FROM orders WHERE id = ?').get(id));
    });
  }

  /* ---------- admin: produk ---------- */
  function cleanProduct(b = {}) {
    const category = oneOf(b.category, CATEGORIES, 'Kategori');
    const basah = category === 'kue-basah';
    return {
      name: text(b.name, 'Nama produk', { required: true, max: 100 }),
      category,
      price: integer(b.price, 'Harga', { min: 0, max: 1e8 }),
      unit: basah ? 'buah' : 'kue',
      stock: basah ? String(integer(b.stock ?? 0, 'Stok', { min: 0, max: 100000 })) : text(b.stock, 'Stok', { max: 50 }) || 'Pre-order',
      size: text(b.size, 'Ukuran', { max: 50 }),
      flavor: text(b.flavor, 'Rasa', { max: 100 }),
      description: text(b.description, 'Deskripsi', { max: 600 }),
    };
  }

  function createProduct(body, image) {
    try {
      const d = cleanProduct(body);
      const r = q(`INSERT INTO products (name, category, price, unit, stock, size, flavor, description, image)
                   VALUES (?,?,?,?,?,?,?,?,?)`)
        .run(d.name, d.category, d.price, d.unit, d.stock, d.size, d.flavor, d.description, image || '');
      return getProduct(r.lastInsertRowid);
    } catch (e) { removeFileIfUnused(image); throw e; }
  }

  function updateProduct(id, body, image) {
    try {
      const old = q('SELECT * FROM products WHERE id = ?').get(Number(id));
      if (!old) throw new HttpError(404, 'Produk tidak ditemukan');
      const d = cleanProduct(body);
      q(`UPDATE products SET name=?, category=?, price=?, unit=?, stock=?, size=?, flavor=?, description=?, image=? WHERE id=?`)
        .run(d.name, d.category, d.price, d.unit, d.stock, d.size, d.flavor, d.description, image || old.image, old.id);
      if (image && old.image && old.image !== image) removeFileIfUnused(old.image);
      return getProduct(old.id);
    } catch (e) { removeFileIfUnused(image); throw e; }
  }

  function deleteProduct(id) {
    const old = q('SELECT image FROM products WHERE id = ?').get(Number(id));
    q('DELETE FROM products WHERE id = ?').run(Number(id));
    if (old) removeFileIfUnused(old.image);
  }

  /* ---------- admin: pengaturan & galeri ---------- */
  function updateSettings(body = {}) {
    const upsert = q('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const values = {};
    for (const k of SETTING_KEYS) {
      if (body[k] === undefined) continue;
      const v = text(body[k], k, { max: SETTING_MAX[k] });
      if (k === 'whatsapp' && v && !/^\+?[\d\s-]{6,25}$/.test(v)) throw bad('Nomor WhatsApp hanya boleh berisi angka, spasi, "-" atau awalan "+"');
      values[k] = v;
    }
    transaction(db, () => Object.entries(values).forEach(([k, v]) => upsert.run(k, v)));
    return getSettings();
  }

  function addGallery(body = {}, image) {
    if (!image) throw bad('Foto wajib diunggah (JPG/PNG, maks. 5 MB)');
    try {
      const r = q('INSERT INTO gallery (title, caption, grp, image) VALUES (?,?,?,?)').run(
        text(body.title, 'Judul', { max: 100 }) || 'Karya baru',
        text(body.caption, 'Keterangan', { max: 200 }),
        body.group === 'kue-basah' ? 'kue-basah' : 'tart',
        image);
      return toGallery(q('SELECT * FROM gallery WHERE id = ?').get(r.lastInsertRowid));
    } catch (e) { removeFileIfUnused(image); throw e; }
  }

  function deleteGallery(id) {
    const old = q('SELECT image FROM gallery WHERE id = ?').get(Number(id));
    q('DELETE FROM gallery WHERE id = ?').run(Number(id));
    if (old) removeFileIfUnused(old.image);
  }

  return {
    listProducts, getProduct, listGallery, getSettings, createCustomRequest, createOrder,
    summary, listOrders, updateOrder, createProduct, updateProduct, deleteProduct,
    updateSettings, addGallery, deleteGallery,
  };
}
