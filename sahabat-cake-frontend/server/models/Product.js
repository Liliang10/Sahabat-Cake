import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Nama produk wajib diisi'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Kategori produk wajib diisi'],
      enum: {
        values: ['tart', 'kue-basah'],
        message: 'Kategori harus berupa "tart" atau "kue-basah"',
      },
      default: 'tart',
    },
    price: {
      type: Number,
      required: [true, 'Harga produk wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
      default: 0,
    },
    unit: {
      type: String,
      default: function () {
        return this.category === 'kue-basah' ? 'buah' : 'kue';
      },
    },
    stock: {
      type: mongoose.Schema.Types.Mixed,
      default: function () {
        return this.category === 'kue-basah' ? 0 : 'Pre-order';
      },
    },
    size: {
      type: String,
      default: '',
      trim: true,
    },
    flavor: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto-assign numeric id if not provided
productSchema.pre('save', async function () {
  if (this.id === undefined || this.id === null) {
    const highest = await mongoose.model('Product').findOne().sort('-id').select('id').lean();
    this.id = highest && typeof highest.id === 'number' ? highest.id + 1 : 1;
  }
  // Sesuaikan default unit dan format stok jika belum diset
  if (!this.unit) {
    this.unit = this.category === 'kue-basah' ? 'buah' : 'kue';
  }
  if (this.category === 'kue-basah' && typeof this.stock !== 'number') {
    this.stock = Number(this.stock) || 0;
  }
});

export const Product = mongoose.model('Product', productSchema);
