import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Perlu masuk sebagai admin' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ message: 'Token otentikasi tidak ditemukan' });
    }

    const secret = process.env.JWT_SECRET || 'sahabat_cake_jwt_secret_dev_2026';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Sesi telah berakhir, silakan login kembali' });
      }
      return res.status(401).json({ message: 'Token tidak valid' });
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ message: 'Akun admin tidak ditemukan atau telah dinonaktifkan' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada verifikasi autentikasi' });
  }
};
