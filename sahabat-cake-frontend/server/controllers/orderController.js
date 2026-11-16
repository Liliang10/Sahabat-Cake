import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

// Pengajuan custom tart dari pengunjung
export const createCustomRequest = async (req, res, next) => {
  try {
    const b = req.body;
    const required = ['nama', 'tema', 'warna', 'ukuran', 'rasa', 'tulisan', 'jumlah', 'tanggal'];
    const missing = required.filter((k) => !String(b[k] || '').trim());

    if (missing.length) {
      return res.status(400).json({
        message: 'Kolom wajib belum diisi',
        missing,
      });
    }

    const nextId = await Order.generateNextId();

    const order = new Order({
      id: nextId,
      customer: b.nama.trim(),
      item: `Custom Tart · ${b.tema.trim()}`,
      type: 'custom',
      date: String(b.tanggal).trim(),
      status: 'menunggu',
      detail: {
        tema: String(b.tema || '').trim(),
        warna: String(b.warna || '').trim(),
        ukuran: String(b.ukuran || '').trim(),
        rasa: String(b.rasa || '').trim(),
        jumlah: b.jumlah,
        tulisan: String(b.tulisan || '').trim(),
        catatan: String(b.catatan || '').trim() || '-',
        referensi: req.file ? req.file.filename : null,
      },
    });

    await order.save();

    res.status(201).json({
      id: order.id,
      status: order.status,
    });
  } catch (error) {
    next(error);
  }
};

// Pemesanan produk katalog dari pengunjung
export const createCatalogOrder = async (req, res, next) => {
  try {
    const { nama, productId, jumlah, tanggal } = req.body;

    if (!nama || !productId || !jumlah || !tanggal) {
      return res.status(400).json({ message: 'Data pesanan belum lengkap' });
    }

    let product = null;
    if (!isNaN(productId)) {
      product = await Product.findOne({ id: Number(productId) });
    } else {
      product = await Product.findById(productId).catch(() => null);
    }

    if (!product) {
      return res.status(404).json({ message: 'Produk yang dipesan tidak ditemukan' });
    }

    const nextId = await Order.generateNextId();

    const order = new Order({
      id: nextId,
      customer: String(nama).trim(),
      item: `${product.name} · ${jumlah} ${product.unit}`,
      type: product.category,
      date: String(tanggal).trim(),
      status: 'menunggu',
    });

    await order.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// Ambil semua daftar pesanan (Admin)
export const getAdminOrders = async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// Perbarui status pesanan dan/atau harga final (Admin)
export const updateAdminOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, finalPrice } = req.body;

    const order = await Order.findOne({ id });
    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    if (status && ['menunggu', 'dikonfirmasi', 'ditolak'].includes(status)) {
      order.status = status;
    }

    if (finalPrice !== undefined) {
      order.finalPrice = finalPrice;
    }

    await order.save();

    res.json(order);
  } catch (error) {
    next(error);
  }
};
