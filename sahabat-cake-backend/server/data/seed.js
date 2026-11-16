// Data awal (contoh konsep). Disalin ke db.json saat server pertama dijalankan.
export const seed = {
  settings: {
    whatsapp: '',
    instagram: '',
    facebook: '',
    address: '',
    hours: '',
    waTemplate:
      'Halo SAHABAT CAKE, saya ingin memesan {produk} sebanyak {jumlah} untuk tanggal {tanggal}. Atas nama {nama}.',
  },
  products: [
    { id: 1, name: 'Blue Garden', category: 'tart', price: 285000, unit: 'kue', stock: 'Pre-order', size: 'Ø 16 cm', flavor: 'Vanila', image: 'blue-garden.jpg', description: 'Tart vanila dengan rangkaian bunga buttercream biru lembut dan pita satin.' },
    { id: 2, name: 'Strawberry Cloud', category: 'tart', price: 265000, unit: 'kue', stock: 'Pre-order', size: 'Ø 16 cm', flavor: 'Vanila', image: 'strawberry-cloud.jpg', description: 'Tart vanila dengan krim lembut dan stroberi segar di atasnya.' },
    { id: 3, name: 'Chocolate Velvet', category: 'tart', price: 250000, unit: 'kue', stock: 'Pre-order', size: 'Ø 16 cm', flavor: 'Cokelat', image: 'chocolate-velvet.jpg', description: 'Tiga lapis cokelat pekat dengan serutan cokelat di permukaan.' },
    { id: 4, name: 'Ivory Bloom', category: 'tart', price: 320000, unit: 'kue', stock: 'Pre-order', size: 'Ø 18 cm', flavor: 'Vanila', image: 'ivory-bloom.jpg', description: 'Tart dua tingkat dengan bunga ivory yang jatuh anggun.' },
    { id: 5, name: 'Klepon Pandan', category: 'kue-basah', price: 3500, unit: 'buah', stock: 40, size: 'Per buah', flavor: 'Pandan & kelapa', image: 'klepon-pandan.jpg', description: 'Bola ketan pandan berisi gula merah cair, digulung kelapa parut.' },
    { id: 6, name: 'Lemper Ayam', category: 'kue-basah', price: 6000, unit: 'buah', stock: 30, size: 'Per buah', flavor: 'Ayam gurih', image: 'lemper-ayam.jpg', description: 'Ketan gurih isi ayam suwir, dibungkus daun pisang.' },
    { id: 7, name: 'Kue Lapis', category: 'kue-basah', price: 4000, unit: 'buah', stock: 24, size: 'Per buah', flavor: 'Pandan', image: 'kue-lapis.jpg', description: 'Lapisan kenyal beraroma pandan yang manis pas.' },
    { id: 8, name: 'Dadar Gulung', category: 'kue-basah', price: 4500, unit: 'buah', stock: 32, size: 'Per buah', flavor: 'Kelapa gula aren', image: 'dadar-gulung.jpg', description: 'Dadar pandan isi kelapa gula aren yang legit.' },
  ],
  orders: [
    { id: 'SC-012', customer: 'Nadia Putri', item: 'Custom Tart · Floral Garden', type: 'custom', date: '2026-11-21', status: 'menunggu', detail: { tema: 'Floral Garden', warna: 'Biru muda & ivory', ukuran: 'Ø 16 cm', rasa: 'Vanila', jumlah: '1 kue', tulisan: 'Selamat ulang tahun, Ibu', catatan: 'Bunga buttercream yang sederhana.' } },
    { id: 'SC-011', customer: 'Rani Putri', item: 'Blue Garden · 1 kue', type: 'tart', date: '2026-11-21', status: 'dikonfirmasi' },
    { id: 'SC-010', customer: 'Dina Ayu', item: 'Klepon Pandan · 20 buah', type: 'kue-basah', date: '2026-11-22', status: 'dikonfirmasi' },
    { id: 'SC-009', customer: 'Arum Sari', item: 'Custom Tart · Minimal Floral', type: 'custom', date: '2026-11-22', status: 'menunggu' },
    { id: 'SC-008', customer: 'Maya Putri', item: 'Custom Tart · Ocean', type: 'custom', date: '2026-11-23', status: 'menunggu' },
    { id: 'SC-007', customer: 'Sinta', item: 'Strawberry Cloud · 1 kue', type: 'tart', date: '2026-11-20', status: 'dikonfirmasi' },
    { id: 'SC-006', customer: 'Bu Lestari', item: 'Lemper Ayam · 30 buah', type: 'kue-basah', date: '2026-11-20', status: 'dikonfirmasi' },
    { id: 'SC-005', customer: 'Wulan', item: 'Chocolate Velvet · 1 kue', type: 'tart', date: '2026-11-19', status: 'dikonfirmasi' },
    { id: 'SC-004', customer: 'Fitri', item: 'Kue Lapis · 25 buah', type: 'kue-basah', date: '2026-11-19', status: 'dikonfirmasi' },
    { id: 'SC-003', customer: 'Yoga', item: 'Ivory Bloom · 1 kue', type: 'tart', date: '2026-11-18', status: 'dikonfirmasi' },
    { id: 'SC-002', customer: 'Lia', item: 'Dadar Gulung · 15 buah', type: 'kue-basah', date: '2026-11-17', status: 'dikonfirmasi' },
    { id: 'SC-001', customer: 'Tika', item: 'Klepon Pandan · 10 buah', type: 'kue-basah', date: '2026-11-16', status: 'dikonfirmasi' },
  ],
  gallery: [
    { id: 1, title: 'Blue Garden', caption: 'Tart katalog · Ø 16 cm', group: 'tart', image: 'blue-garden.jpg' },
    { id: 2, title: 'Ivory Bloom', caption: 'Tart katalog · Ø 18 cm', group: 'tart', image: 'ivory-bloom.jpg' },
    { id: 3, title: 'Strawberry Cloud', caption: 'Tart katalog · Ø 16 cm', group: 'tart', image: 'strawberry-cloud.jpg' },
    { id: 4, title: 'Suguhan bersama', caption: 'Koleksi kue basah sesuai katalog', group: 'kue-basah', image: 'kue-basah-cover.jpg' },
    { id: 5, title: 'Chocolate Velvet', caption: 'Tart katalog · Ø 16 cm', group: 'tart', image: 'chocolate-velvet.jpg' },
    { id: 6, title: 'Klepon Pandan', caption: 'Rasa akrab · Pandan & kelapa', group: 'kue-basah', image: 'klepon-pandan.jpg' },
  ],
};
