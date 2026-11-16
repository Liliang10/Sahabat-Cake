import { config, assertConfig } from './src/config.js';
import { openDb } from './src/db.js';
import { createAuth, loadSecret } from './src/auth.js';
import { createServices } from './src/services.js';
import { createUploader } from './src/uploads.js';
import { createApp } from './src/app.js';

assertConfig();
if (!config.isProd && config.adminPassword === 'sahabat123')
  console.warn('[peringatan] Memakai kata sandi admin bawaan. Setel ADMIN_PASSWORD sebelum dipakai sungguhan.');

const db = openDb(config.dbFile, { legacyJson: config.legacyJson });
const auth = createAuth({
  password: config.adminPassword,
  secret: loadSecret(db, config.tokenSecret),
  ttlMs: config.tokenTtlMs,
});
const uploader = createUploader({ dir: config.uploadDir, maxBytes: config.maxUploadBytes });
const services = createServices({ db, uploadDir: config.uploadDir });
const app = createApp({ services, auth, uploader, config });

const server = app.listen(config.port, () =>
  console.log(`SAHABAT CAKE API berjalan di http://localhost:${config.port}`));

const stop = () => server.close(() => { db.close(); process.exit(0); });
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
