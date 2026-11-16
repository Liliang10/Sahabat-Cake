import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { seed } from '../data/seed.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tart','kue-basah')),
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  unit TEXT NOT NULL,
  stock TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  flavor TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS orders (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT NOT NULL UNIQUE,
  customer TEXT NOT NULL,
  item TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tart','kue-basah','custom')),
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu','dikonfirmasi','ditolak')),
  detail TEXT,
  final_price INTEGER,
  product_id INTEGER,
  qty INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders (date);
CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  grp TEXT NOT NULL CHECK (grp IN ('tart','kue-basah')),
  image TEXT NOT NULL
);
`;

export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const r = fn();
    db.exec('COMMIT');
    return r;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

export function importData(db, data) {
  transaction(db, () => {
    const setting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(data.settings || {})) setting.run(k, String(v ?? ''));

    const prod = db.prepare(
      'INSERT INTO products (id, name, category, price, unit, stock, size, flavor, description, image) VALUES (?,?,?,?,?,?,?,?,?,?)');
    for (const p of data.products || [])
      prod.run(p.id, p.name, p.category, Number(p.price) || 0, p.unit || (p.category === 'tart' ? 'kue' : 'buah'),
        String(p.stock ?? ''), p.size || '', p.flavor || '', p.description || '', p.image || '');

    // data lama berurutan dari terbaru → sisipkan terbalik agar urutan "terbaru" tetap benar
    const ord = db.prepare(
      'INSERT INTO orders (id, customer, item, type, date, status, detail, final_price) VALUES (?,?,?,?,?,?,?,?)');
    for (const o of [...(data.orders || [])].reverse()) {
      const fp = o.finalPrice == null || o.finalPrice === '' ? null : Number(String(o.finalPrice).replace(/\D/g, '')) || null;
      ord.run(o.id, o.customer, o.item, o.type, o.date, o.status || 'menunggu', o.detail ? JSON.stringify(o.detail) : null, fp);
    }

    const gal = db.prepare('INSERT INTO gallery (id, title, caption, grp, image) VALUES (?,?,?,?,?)');
    for (const g of data.gallery || []) gal.run(g.id, g.title, g.caption || '', g.group, g.image);
  });
}

/**
 * Membuka (dan menyiapkan) database.
 * Saat pertama kali: impor data/db.json versi prototipe jika ada, jika tidak pakai data contoh.
 */
export function openDb(file, { legacyJson } = {}) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);

  const seeded = db.prepare("SELECT 1 FROM meta WHERE key = 'seeded'").get();
  if (!seeded) {
    let data = seed;
    let source = 'seed';
    if (legacyJson && fs.existsSync(legacyJson)) {
      try { data = JSON.parse(fs.readFileSync(legacyJson, 'utf8')); source = 'db.json'; }
      catch { /* file rusak → pakai data contoh */ }
    }
    importData(db, data);
    db.prepare("INSERT INTO meta (key, value) VALUES ('seeded', ?)").run(source);
  }
  return db;
}
