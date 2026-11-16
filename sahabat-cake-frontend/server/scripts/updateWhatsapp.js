import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Setting } from '../models/Setting.js';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

try {
  await connectDB();
  const result = await Setting.updateOne(
    {},
    { $set: { whatsapp: '6285954531100' } },
    { timestamps: false }
  );
  if (result.matchedCount === 0) {
    throw new Error('Dokumen pengaturan tidak ditemukan; jalankan seeder sebelum memperbarui nomor.');
  }
  console.log('[WhatsApp] Nomor pengaturan berhasil diperbarui.');
} catch (error) {
  console.error('[WhatsApp] Gagal memperbarui nomor:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
