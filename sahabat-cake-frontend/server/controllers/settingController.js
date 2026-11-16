import { Setting } from '../models/Setting.js';

const normalizeWhatsapp = (value) => {
  const digits = String(value).replace(/\D/g, '');
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
};

// Ambil pengaturan website (Publik)
export const getSettings = async (_req, res, next) => {
  try {
    const settings = await Setting.getSingleton();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Perbarui pengaturan website (Admin)
export const updateSettings = async (req, res, next) => {
  try {
    const settings = await Setting.getSingleton();
    const allowed = ['whatsapp', 'instagram', 'facebook', 'address', 'hours', 'waTemplate'];

    allowed.forEach((k) => {
      if (req.body[k] !== undefined) {
        const value = String(req.body[k]).trim();
        settings[k] = k === 'whatsapp' ? normalizeWhatsapp(value) : value;
      }
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};
