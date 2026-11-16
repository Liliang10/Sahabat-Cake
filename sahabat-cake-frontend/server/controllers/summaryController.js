import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

export const getDashboardSummary = async (_req, res, next) => {
  try {
    const [products, orders] = await Promise.all([
      Product.find().lean(),
      Order.find().sort({ createdAt: -1, id: -1 }).lean(),
    ]);

    const tartProductsCount = products.filter((p) => p.category === 'tart').length;
    const kueBasahProducts = products.filter((p) => p.category === 'kue-basah');
    const kueBasahProductsCount = kueBasahProducts.length;

    const stockBasah = kueBasahProducts.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);

    const totalOrders = orders.length;
    const confirmedCount = orders.filter((o) => o.status === 'dikonfirmasi').length;
    const waitingCount = orders.filter((o) => o.status === 'menunggu').length;
    const customWaitingCount = orders.filter((o) => o.type === 'custom' && o.status === 'menunggu').length;

    // Hitung per tanggal untuk pesanan masuk (6 hari terakhir yang ada pesanan)
    const daysMap = {};
    orders.forEach((o) => {
      if (o.date) {
        daysMap[o.date] = (daysMap[o.date] || 0) + 1;
      }
    });

    const perDay = Object.keys(daysMap)
      .sort()
      .slice(-6)
      .map((date) => ({
        date,
        count: daysMap[date],
      }));

    const countByType = (type) => orders.filter((o) => o.type === type).length;

    const composition = {
      tart: countByType('tart'),
      kueBasah: countByType('kue-basah'),
      custom: countByType('custom'),
    };

    const latest = orders.slice(0, 5);

    res.json({
      products: products.length,
      tart: tartProductsCount,
      kueBasah: kueBasahProductsCount,
      orders: totalOrders,
      confirmed: confirmedCount,
      waiting: waitingCount,
      customWaiting: customWaitingCount,
      stockBasah,
      perDay,
      composition,
      latest,
    });
  } catch (error) {
    next(error);
  }
};
