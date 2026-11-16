import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Judul foto galeri wajib diisi'],
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    group: {
      type: String,
      required: [true, 'Kelompok galeri wajib diisi'],
      enum: {
        values: ['tart', 'kue-basah'],
        message: 'Kelompok harus "tart" atau "kue-basah"',
      },
      default: 'tart',
    },
    image: {
      type: String,
      required: [true, 'Nama file gambar wajib ada'],
      trim: true,
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

gallerySchema.pre('save', async function () {
  if (this.id === undefined || this.id === null) {
    const highest = await mongoose.model('Gallery').findOne().sort('-id').select('id').lean();
    this.id = highest && typeof highest.id === 'number' ? highest.id + 1 : 1;
  }
});

export const Gallery = mongoose.model('Gallery', gallerySchema);
