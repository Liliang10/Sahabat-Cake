import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Gallery } from '../models/Gallery.js';
import { Setting } from '../models/Setting.js';
import { initialData } from './initialData.js';

const __filename = fileURLToPath(import.meta.url);

export const seedDatabase = async ({ reset = false } = {}) => {
  console.log('[Seeder] Memulai proses seeding database...');

  if (reset) {
    console.log('[Seeder] Mengosongkan data lama (--reset aktif)...');
    await Promise.all([
      Admin.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Gallery.deleteMany({}),
      Setting.deleteMany({}),
    ]);
  }

  // 1. Seed Akun Admin
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@sahabatcake.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'sahabat123';

  let admin = await Admin.findOne({
    $or: [{ username: adminUsername }, { email: adminEmail }],
  });

  if (!admin) {
    admin = new Admin({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      name: 'Administrator Sahabat Cake',
    });
    await admin.save();
    console.log(`[Seeder] Akun admin berhasil dibuat (Username: ${adminUsername}, Email: ${adminEmail})`);
  } else {
    console.log('[Seeder] Akun admin sudah tersedia.');
  }

  // 2. Seed Pengaturan Website
  const settingCount = await Setting.countDocuments();
  if (settingCount === 0) {
    await Setting.create(initialData.settings);
    console.log('[Seeder] Pengaturan website berhasil disimpan.');
  } else {
    console.log('[Seeder] Pengaturan website sudah ada.');
  }

  // 3. Seed Produk
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    for (const p of initialData.products) {
      await Product.create(p);
    }
    console.log(`[Seeder] ${initialData.products.length} produk katalog berhasil disimpan.`);
  } else {
    console.log(`[Seeder] Koleksi produk sudah terisi (${productCount} produk).`);
  }

  // 4. Seed Galeri
  const galleryCount = await Gallery.countDocuments();
  if (galleryCount === 0) {
    for (const g of initialData.gallery) {
      await Gallery.create(g);
    }
    console.log(`[Seeder] ${initialData.gallery.length} item galeri berhasil disimpan.`);
  } else {
    console.log(`[Seeder] Koleksi galeri sudah terisi (${galleryCount} item).`);
  }

  // 5. Seed Pesanan
  const orderCount = await Order.countDocuments();
  if (orderCount === 0) {
    for (const o of initialData.orders) {
      await Order.create(o);
    }
    console.log(`[Seeder] ${initialData.orders.length} pesanan contoh berhasil disimpan.`);
  } else {
    console.log(`[Seeder] Koleksi pesanan sudah terisi (${orderCount} pesanan).`);
  }

  console.log('[Seeder] Proses seeding database selesai dengan sukses.');
};

// Jalankan langsung jika dipanggil via node data/seed.js
const isDirectCall = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectCall) {
  const dotenv = await import('dotenv');
  dotenv.config({ path: path.resolve(path.dirname(__filename), '../.env') });
  const shouldReset = process.argv.includes('--reset') || process.argv.includes('--force');
  (async () => {
    try {
      await connectDB();
      await seedDatabase({ reset: shouldReset });
      await mongoose.disconnect();
      console.log('[Seeder] Koneksi MongoDB ditutup.');
      process.exit(0);
    } catch (err) {
      console.error('[Seeder] Error saat seeding:', err);
      process.exit(1);
    }
  })();
}
