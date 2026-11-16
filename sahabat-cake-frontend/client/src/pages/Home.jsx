import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductModal from '../components/ProductModal.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.products().then((all) => {
      const tart = all.filter((p) => p.category === 'tart').slice(0, 2);
      const basah = all.filter((p) => p.category === 'kue-basah').slice(0, 2);
      setProducts([...tart, ...basah]);
    }).catch((ex) => setError(ex.message));
  }, []);

  return (
    <>
      <section className="container hero">
        <div>
          <span className="eyebrow">Dibuat dengan hati, dinikmati bersama</span>
          <h1 className="h-hero">Sepotong manis, sejuta cerita.</h1>
          <p>Dari tart untuk hari istimewa hingga kue basah untuk jeda sederhana. Temukan rasa yang membuat setiap momen terasa lebih dekat.</p>
          <div className="cta">
            <Link to="/katalog-tart" className="btn btn-solid">Jelajahi katalog <span>↗</span></Link>
            <Link to="/custom-tart" className="btn btn-line">Buat custom tart <span>↗</span></Link>
          </div>
          <div className="note">Tart & kue basah · Pesan langsung via WhatsApp</div>
        </div>
        <div>
          <div className="arch"><img src="/uploads/hero.jpg" alt="Tart bunga biru dengan sepotong irisan" /></div>
          <div className="cap"><span>KOLEKSI UNTUK PERAYAAN</span><span>Manis yang terasa personal.</span></div>
        </div>
      </section>

      <div className="strip"><div className="container">
        <span>Tart untuk momen istimewa</span><span>Kue basah, rasa yang akrab</span><span>Pemesanan sederhana via WhatsApp</span>
      </div></div>

      <section className="section"><div className="container">
        <div className="sec-head">
          <div><span className="eyebrow">Pilihan Sahabat</span><h2 className="h-sec">Untuk dirayakan.<br />Untuk dibagikan.</h2></div>
          <p>Dua koleksi, satu perhatian yang sama: menghadirkan manis di meja Anda.</p>
        </div>
        <div className="two">
          <div className="feature">
            <img src="/uploads/tart-perayaan.jpg" alt="Tart perayaan" />
            <span className="eyebrow">01 / Momen perayaan</span>
            <div className="row"><h3>Tart perayaan</h3><Link to="/katalog-tart" className="btn btn-line btn-sm">Lihat koleksi tart <span>↗</span></Link></div>
            <p className="small">Pilih desain favorit atau ceritakan ide tart Anda.</p>
          </div>
          <div className="feature">
            <img src="/uploads/kue-basah-cover.jpg" alt="Kue basah" />
            <span className="eyebrow">02 / Manis sehari-hari</span>
            <div className="row"><h3>Kue basah</h3><Link to="/kue-basah" className="btn btn-line btn-sm">Lihat kue basah <span>↗</span></Link></div>
            <p className="small">Rasa akrab untuk suguhan dan kebersamaan.</p>
          </div>
        </div>
      </div></section>

      <section className="section white"><div className="container">
        <span className="eyebrow">Dari katalog kami</span>
        <div className="sec-head"><h2 className="h-sec">Kenalan dengan pilihan manis ini.</h2><Link to="/katalog-tart" className="link">Semua produk contoh konsep ↗</Link></div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="grid4">{products.map((p) => <ProductCard key={p.id} p={p} onOpen={setOpen} />)}</div>
        <p className="small" style={{ marginTop: 32 }}>Harga dan stok ditampilkan sebagai contoh konsep. Ketersediaan akhir dikonfirmasi penjual.</p>
      </div></section>

      <section className="section"><div className="container split">
        <img src="/uploads/baker.jpg" alt="Menghias tart dengan bunga buttercream" style={{ aspectRatio: '464 / 485' }} />
        <div>
          <span className="eyebrow">Lebih dari sekadar kue</span>
          <h2 className="h-sec">Perhatian kecil,<br />rasa yang berarti.</h2>
          <p style={{ margin: '24px 0 28px', lineHeight: 1.8 }}>Kami ingin menjadi sahabat dalam menyiapkan suguhan. Mulai dari memilih kue hingga membicarakan detail perayaan, semuanya terasa sederhana.</p>
          <div className="ticks">
            <div>Pilihan yang jelas — tart dan kue basah dalam katalog yang tertata.</div>
            <div>Sentuhan personal — ide custom khusus untuk tart Anda.</div>
            <div>Komunikasi langsung — detail dan jadwal dibicarakan dengan penjual.</div>
          </div>
          <Link to="/tentang-kami" className="btn btn-line" style={{ marginTop: 28 }}>Cerita Sahabat Cake <span>↗</span></Link>
        </div>
      </div></section>

      <section className="mint quote"><div className="container">
        <span className="eyebrow">Cerita di meja mereka</span>
        <h2>“Tart yang sederhana, tetapi terasa istimewa. Jadi bagian paling manis dari perayaan kecil kami.”</h2>
        <p className="small">Rani · Contoh testimoni untuk konsep desain</p>
      </div></section>

      <section className="section"><div className="container">
        <div className="sec-head">
          <div><span className="eyebrow">Cara pesan</span><h2 className="h-sec">Dari pilihan ke percakapan.</h2></div>
          <p>Tanpa keranjang atau checkout. Cukup pilih, ceritakan, lalu konfirmasi.</p>
        </div>
        <div className="steps">
          <div><div className="n">01</div><h3>Temukan favorit</h3><p>Pilih tart atau kue basah di katalog. Ingin lebih personal? Gunakan form custom tart.</p></div>
          <div><div className="n">02</div><h3>Kirim detail pesanan</h3><p>Isi nama, jumlah dan tanggal. Ringkasan membantu menyiapkan pesan WhatsApp Anda.</p></div>
          <div><div className="n">03</div><h3>Konfirmasi bersama</h3><p>Penjual mengonfirmasi stok dan jadwal. Custom tart menunggu persetujuan desain dan harga final.</p></div>
        </div>
      </div></section>

      <section className="cta-final"><div className="container in">
        <div><span className="eyebrow">Untuk momen berikutnya</span><h2 className="h-sec">Ada cerita manis yang ingin dibuat?</h2>
          <p className="small" style={{ marginTop: 16, fontSize: 14 }}>Mulai dari koleksi kami, atau ceritakan ide custom tart Anda.</p></div>
        <Link to="/galeri-kontak" className="btn btn-solid">Mulai percakapan <span>↗</span></Link>
      </div></section>

      {open && <ProductModal p={open} onClose={() => setOpen(null)} />}
    </>
  );
}
