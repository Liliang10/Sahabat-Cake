import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    whatsapp: {
      type: String,
      default: '',
      trim: true,
    },
    instagram: {
      type: String,
      default: '',
      trim: true,
    },
    facebook: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    hours: {
      type: String,
      default: '',
      trim: true,
    },
    waTemplate: {
      type: String,
      default:
        'Halo SAHABAT CAKE, saya ingin memesan {produk} sebanyak {jumlah} untuk tanggal {tanggal}. Atas nama {nama}.',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method bantuan untuk mengambil singleton dokumen pengaturan
settingSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

export const Setting = mongoose.model('Setting', settingSchema);
