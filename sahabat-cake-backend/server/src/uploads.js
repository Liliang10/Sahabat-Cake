import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { HttpError, bad } from './errors.js';
import { looksLikeImage } from './imageCheck.js';

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png' };

export function createUploader({ dir, maxBytes }) {
  fs.mkdirSync(dir, { recursive: true });
  const multerInstance = multer({
    storage: multer.diskStorage({
      destination: dir,
      filename: (_req, f, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXT[f.mimetype] || ''}`),
    }),
    limits: { fileSize: maxBytes, files: 1 },
    fileFilter: (_req, f, cb) =>
      EXT[f.mimetype] ? cb(null, true) : cb(bad('Foto harus berformat JPG atau PNG')),
  });

  const readHead = (file) => {
    const fd = fs.openSync(file, 'r');
    try { const b = Buffer.alloc(8); fs.readSync(fd, b, 0, 8, 0); return b; } finally { fs.closeSync(fd); }
  };

  /** Middleware: terima satu foto di field `field` (opsional), tolak jika bukan JPG/PNG sungguhan. */
  const single = (field) => (req, res, next) =>
    multerInstance.single(field)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(bad(`Ukuran foto maksimal ${maxBytes / 1024 / 1024} MB`));
        if (err instanceof multer.MulterError) return next(bad('Unggahan tidak valid'));
        return next(err);
      }
      if (req.file && !looksLikeImage(readHead(req.file.path))) {
        fs.rmSync(req.file.path, { force: true });
        return next(new HttpError(400, 'Berkas bukan gambar JPG/PNG yang valid'));
      }
      next();
    });

  return { single, dir };
}
