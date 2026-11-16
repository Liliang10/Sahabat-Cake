import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = process.env;
const isProd = env.NODE_ENV === 'production';

export const config = {
  root,
  isProd,
  port: Number(env.PORT) || 4001,
  dbFile: env.DB_FILE || path.join(root, 'data', 'sahabat.sqlite'),
  legacyJson: path.join(root, 'data', 'db.json'), // data lama dari versi prototipe (diimpor sekali)
  uploadDir: env.UPLOAD_DIR || path.join(root, 'uploads'),
  clientDist: path.join(root, '..', 'client', 'dist'),
  adminPassword: env.ADMIN_PASSWORD || (isProd ? '' : 'sahabat123'),
  tokenSecret: env.TOKEN_SECRET || '',
  tokenTtlMs: (Number(env.TOKEN_TTL_HOURS) || 12) * 3600 * 1000,
  corsOrigin: env.CORS_ORIGIN || '',
  trustProxy: env.TRUST_PROXY || '',
  maxUploadBytes: 5 * 1024 * 1024,
};

export function assertConfig(c = config) {
  if (!c.adminPassword) throw new Error('ADMIN_PASSWORD wajib diisi saat NODE_ENV=production');
  if (c.isProd && c.adminPassword === 'sahabat123') throw new Error('Ganti ADMIN_PASSWORD bawaan sebelum produksi');
}
