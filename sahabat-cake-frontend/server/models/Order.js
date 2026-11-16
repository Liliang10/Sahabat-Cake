import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true,
    },
    customer: {
      type: String,
      required: [true, 'Nama pelanggan wajib diisi'],
      trim: true,
    },
    item: {
      type: String,
      required: [true, 'Item pesanan wajib diisi'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Tipe pesanan wajib diisi'],
      enum: {
        values: ['tart', 'kue-basah', 'custom'],
        message: 'Tipe pesanan harus berupa "tart", "kue-basah", atau "custom"',
      },
    },
    date: {
      type: String,
      required: [true, 'Tanggal kebutuhan wajib diisi'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['menunggu', 'dikonfirmasi', 'ditolak'],
        message: 'Status harus berupa "menunggu", "dikonfirmasi", atau "ditolak"',
      },
      default: 'menunggu',
    },
    finalPrice: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    detail: {
      tema: { type: String, default: '' },
      warna: { type: String, default: '' },
      ukuran: { type: String, default: '' },
      rasa: { type: String, default: '' },
      jumlah: { type: mongoose.Schema.Types.Mixed, default: '' },
      tulisan: { type: String, default: '' },
      catatan: { type: String, default: '-' },
      referensi: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method statis untuk menghasilkan ID pesanan berikutnya secara terurut
orderSchema.statics.generateNextId = async function () {
  const orders = await this.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const o of orders) {
    if (o.id && typeof o.id === 'string' && o.id.startsWith('SC-')) {
      const num = parseInt(o.id.replace('SC-', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return 'SC-' + String(maxNum + 1).padStart(3, '0');
};

orderSchema.pre('save', async function () {
  if (!this.id) {
    this.id = await mongoose.model('Order').generateNextId();
  }
});

export const Order = mongoose.model('Order', orderSchema);
