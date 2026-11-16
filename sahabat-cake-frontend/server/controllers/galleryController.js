import { Gallery } from '../models/Gallery.js';
import fs from 'fs';
import path from 'path';
import { uploadsPath } from '../config/multer.js';

// Ambil semua foto galeri (Publik)
export const getGallery = async (_req, res, next) => {
  try {
    const items = await Gallery.find().sort({ id: 1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// Tambah foto galeri baru (Admin)
export const createGallery = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Foto wajib diunggah (JPG/PNG, maks. 5 MB)',
      });
    }

    const { title, caption, group } = req.body;

    const item = new Gallery({
      title: String(title || 'Karya baru').trim(),
      caption: String(caption || '').trim(),
      group: group === 'kue-basah' ? 'kue-basah' : 'tart',
      image: req.file.filename,
    });

    await item.save();

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// Hapus foto galeri (Admin)
export const deleteGallery = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let item = null;

    if (!isNaN(idParam)) {
      item = await Gallery.findOneAndDelete({ id: Number(idParam) });
    } else {
      item = await Gallery.findByIdAndDelete(idParam).catch(() => null);
    }

    if (!item) {
      return res.status(404).json({ message: 'Item galeri tidak ditemukan' });
    }

    // Hapus file fisik jika bukan file bawaan/seed
    if (item.image && item.image.includes('-')) {
      const filePath = path.join(uploadsPath, item.image);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
