import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Kata sandi wajib diisi' });
    }

    let admin = null;
    const identifier = (username || email || '').trim();

    if (identifier) {
      admin = await Admin.findOne({
        $or: [{ username: identifier.toLowerCase() }, { email: identifier.toLowerCase() }],
      });
    } else {
      // Jika frontend hanya mengirim { password }, ambil admin utama
      admin = await Admin.findOne().sort({ createdAt: 1 });
    }

    if (!admin) {
      return res.status(401).json({ message: 'Akun admin tidak ditemukan atau kredensial salah' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Kata sandi salah' });
    }

    const secret = process.env.JWT_SECRET || 'sahabat_cake_jwt_secret_dev_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: 'admin',
      },
      secret,
      { expiresIn }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req, res) => {
  res.json({ message: 'Berhasil keluar' });
};

export const getMe = async (req, res) => {
  res.json({
    admin: req.admin,
  });
};

export const verifyToken = async (req, res) => {
  res.json({
    valid: true,
    admin: req.admin,
  });
};
