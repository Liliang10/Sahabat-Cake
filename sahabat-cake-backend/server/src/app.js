import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { HttpError } from './errors.js';
import { createLimiter } from './ratelimit.js';

export function createApp({ services: s, auth, uploader, config }) {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', /^\d+$/.test(config.trustProxy) ? Number(config.trustProxy) : config.trustProxy);

  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    next();
  });
  // Frontend memakai proxy same-origin; CORS hanya dibuka bila diminta (atau saat pengembangan).
  if (config.corsOrigin) app.use(cors({ origin: config.corsOrigin.split(',').map((x) => x.trim()) }));
  else if (!config.isProd) app.use(cors());
  app.use(express.json({ limit: '100kb' }));
  app.use('/uploads', express.static(uploader.dir, { maxAge: '7d', index: false, fallthrough: false }));

  const loginLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
  const submitLimiter = createLimiter({ windowMs: 10 * 60 * 1000, max: 30 });
  const limit = (limiter) => (req, res, next) => {
    const r = limiter.consume(req.ip);
    if (r.ok) return next();
    res.set('Retry-After', String(r.retryAfter));
    next(new HttpError(429, 'Terlalu banyak permintaan, coba lagi sebentar lagi'));
  };

  const adminOnly = (req, _res, next) => {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    next(auth.verify(token) ? undefined : new HttpError(401, 'Perlu masuk sebagai admin'));
  };

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  /* ---------- Publik ---------- */
  app.get('/api/products', (req, res) => res.json(s.listProducts(req.query.category)));
  app.get('/api/products/:id', (req, res) => res.json(s.getProduct(req.params.id)));
  app.get('/api/gallery', (_req, res) => res.json(s.listGallery()));
  app.get('/api/settings', (_req, res) => res.json(s.getSettings()));

  app.post('/api/custom-requests', limit(submitLimiter), uploader.single('referensi'), (req, res) => {
    res.status(201).json(s.createCustomRequest(req.body, req.file?.filename));
  });
  app.post('/api/orders', limit(submitLimiter), (req, res) => res.status(201).json(s.createOrder(req.body)));

  /* ---------- Admin ---------- */
  app.post('/api/admin/login', (req, res, next) => {
    const r = loginLimiter.consume(req.ip);
    if (!r.ok) {
      res.set('Retry-After', String(r.retryAfter));
      return next(new HttpError(429, 'Terlalu banyak percobaan masuk, coba lagi nanti'));
    }
    if (!auth.checkPassword(req.body?.password)) return next(new HttpError(401, 'Kata sandi salah'));
    loginLimiter.reset(req.ip);
    res.json({ token: auth.issue() });
  });

  app.use('/api/admin', adminOnly);
  app.get('/api/admin/summary', (_req, res) => res.json(s.summary()));
  app.get('/api/admin/orders', (_req, res) => res.json(s.listOrders()));
  app.patch('/api/admin/orders/:id', (req, res) => res.json(s.updateOrder(req.params.id, req.body)));

  app.post('/api/admin/products', uploader.single('image'), (req, res) => res.status(201).json(s.createProduct(req.body, req.file?.filename)));
  app.put('/api/admin/products/:id', uploader.single('image'), (req, res) => res.json(s.updateProduct(req.params.id, req.body, req.file?.filename)));
  app.delete('/api/admin/products/:id', (req, res) => { s.deleteProduct(req.params.id); res.status(204).end(); });

  app.put('/api/admin/settings', (req, res) => res.json(s.updateSettings(req.body)));

  app.post('/api/admin/gallery', uploader.single('image'), (req, res) => res.status(201).json(s.addGallery(req.body, req.file?.filename)));
  app.delete('/api/admin/gallery/:id', (req, res) => { s.deleteGallery(req.params.id); res.status(204).end(); });

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Endpoint tidak ditemukan')));

  // Produksi: sajikan hasil build React dari proses yang sama
  const index = path.join(config.clientDist, 'index.html');
  if (config.isProd && fs.existsSync(index)) {
    app.use(express.static(config.clientDist, { maxAge: '1h', index: false }));
    app.get('*', (_req, res) => res.sendFile(index));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Format JSON tidak valid' });
    if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Permintaan terlalu besar' });
    if (err.status === 404 && req.path.startsWith('/uploads')) return res.status(404).json({ message: 'Berkas tidak ditemukan' });
    if (err instanceof HttpError) return res.status(err.status).json({ message: err.message, ...err.extra });
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  });

  return app;
}
