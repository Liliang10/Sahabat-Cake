import { Product } from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { uploadsPath } from '../config/multer.js';

// Format payload produk agar konsisten sesuai kategori
const parseProductData = (body, filename) => {
  const category = body.category === 'kue-basah' ? 'kue-basah' : 'tart';
  const unit = category === 'kue-basah' ? 'buah' : 'kue';
  const stock = category === 'kue-basah' ? Number(body.stock) || 0 : body.stock || 'Pre-order';

  const data = {
    name: String(body.name || '').trim(),
    category,
    price: Number(body.price) || 0,
    unit,
    stock,
    size: String(body.size || '').trim(),
    flavor: String(body.flavor || '').trim(),
    description: String(body.description || '').trim(),
  };

  if (filename) {
    data.image = filename;
  }

  return data;
};

// Ambil daftar produk (bisa difilter berdasarkan query ?category=)
export const getProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && ['tart', 'kue-basah'].includes(category)) {
      filter.category = category;
    }
    const products = await Product.find(filter).sort({ id: 1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Ambil detail satu produk berdasarkan ID numerik atau _id
export const getProductById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let product = null;

    if (!isNaN(idParam)) {
      product = await Product.findOne({ id: Number(idParam) });
    } else {
      product = await Product.findById(idParam).catch(() => null);
    }

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Tambah produk baru (Admin)
export const createProduct = async (req, res, next) => {
  try {
    const data = parseProductData(req.body, req.file?.filename);

    if (!data.name) {
      return res.status(400).json({ message: 'Nama produk wajib diisi' });
    }

    const product = new Product(data);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Perbarui produk (Admin)
export const updateProduct = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let product = null;

    if (!isNaN(idParam)) {
      product = await Product.findOne({ id: Number(idParam) });
    } else {
      product = await Product.findById(idParam).catch(() => null);
    }

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const data = parseProductData(req.body, req.file?.filename);
    if (!data.name) {
      return res.status(400).json({ message: 'Nama produk wajib diisi' });
    }

    // Jika upload gambar baru dan sebelumnya ada gambar kustom, hapus file lama jika perlu
    if (req.file && product.image && product.image !== req.file.filename) {
      const oldPath = path.join(uploadsPath, product.image);
      // Hanya hapus jika bukan file default/seed jika diinginkan
      if (fs.existsSync(oldPath) && product.image.includes('-')) {
        try {
          fs.unlinkSync(oldPath);
        } catch (_) {}
      }
    }

    Object.assign(product, data);
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Hapus produk (Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let product = null;

    if (!isNaN(idParam)) {
      product = await Product.findOneAndDelete({ id: Number(idParam) });
    } else {
      product = await Product.findByIdAndDelete(idParam).catch(() => null);
    }

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
