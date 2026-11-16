import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductModal from '../components/ProductModal.jsx';

const copy = {
  tart: {
    tag: 'Koleksi tart', title: 'Untuk momen yang ingin dikenang.',
    lead: 'Desain yang tenang, rasa yang menyenangkan. Pilih tart dari katalog atau ajukan ide personal melalui halaman Custom Tart.',
    sub: 'Ukuran 16–18 cm · Sistem pre-order', label: 'Semua tart', note: 'Produk dan harga merupakan contoh konsep',
    info: () => 'Semua tart katalog dibuat berdasarkan pesanan. Jadwal dan ketersediaan dikonfirmasi melalui WhatsApp; pesanan belum otomatis diterima.',
  },
  'kue-basah': {
    tag: 'Koleksi kue basah', title: 'Rasa akrab untuk dibagikan.',
    lead: 'Untuk suguhan keluarga, teman berbincang, atau meja pertemuan. Pilih kue basah favorit sesuai katalog, lalu sampaikan jumlah dan tanggal kebutuhan Anda.',
    sub: 'Harga per buah · Sesuai katalog', label: 'Semua kue basah', note: 'Harga & stok merupakan contoh konsep',
    info: (list) => `Kue basah hanya tersedia sesuai katalog, tanpa custom tema, warna, ukuran atau rasa. Stok contoh saat ini: ${list.map((p) => `${p.name.split(' ')[0]} ${p.stock}`).join(', ')} buah.`,
  },
};

export default function Catalog({ category }) {
  const c = copy[category];
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    setError('');
    api.products(category)
      .then(setList)
      .catch((ex) => setError(ex.message))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <section className="container" style={{ paddingTop: 60, paddingBottom: 90 }}>
      <span className="eyebrow">{c.tag} / {String(list.length).padStart(2, '0')} pilihan</span>
      <h1 className="h-page">{c.title}</h1>
      <p className="lead">{c.lead}</p>
      <div className="filters">
        <div><span className="pill">{c.label} · {list.length}</span><span>{c.sub}</span></div>
        <span>{c.note}</span>
      </div>
      {loading ? <p>Memuat…</p> : error ? <p className="error" role="alert">{error}</p> : <div className="grid4">{list.map((p) => <ProductCard key={p.id} p={p} onOpen={setOpen} />)}</div>}
      <div className="info">{c.info(list)}</div>
      {open && <ProductModal p={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
