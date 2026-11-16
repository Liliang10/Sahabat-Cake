import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useSettings } from '../components/Settings.jsx';
import { img, waLink } from '../utils.js';

export default function Gallery() {
  const { settings: s } = useSettings();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('all');
  useEffect(() => { api.gallery().then(setItems).catch(() => {}); }, []);
  const shown = items.filter((g) => tab === 'all' || g.group === tab);
  const wa = waLink(s.whatsapp, 'Halo SAHABAT CAKE, saya ingin bertanya tentang pesanan.');
  const tabs = [['all', 'Semua karya'], ['tart', 'Tart perayaan'], ['kue-basah', 'Kue basah']];
  const empty = (v, l) => v || `[${l} perlu diisi]`;

  return (
    <>
      <section className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <span className="eyebrow">Galeri & Kontak</span>
        <h1 className="h-page">Cerita manis, dalam bingkai.</h1>
        <p className="lead">Jelajahi inspirasi tart dan suguhan kue basah. Temukan yang Anda suka, lalu mulai percakapan tentang momen berikutnya.</p>
        <div className="tabs">
          {tabs.map(([k, l], i) => (
            <span key={k} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <button className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>{i === 1 && <span>/</span>}
            </span>
          ))}
        </div>
        <div className="gal">
          {shown.map((g) => (
            <figure key={g.id} style={{ margin: 0 }}>
              <img src={img(g.image)} alt={g.title} loading="lazy" />
              <div className="t"><h3>{g.title}</h3><span>↗</span></div>
              <div className="small">{g.caption}</div>
            </figure>
          ))}
        </div>
        <p className="small" style={{ marginTop: 40 }}>Fotografi visual konsep · Bukan dokumentasi produk nyata usaha.</p>
      </section>

      <section className="section white"><div className="container split" style={{ alignItems: 'start' }}>
        <div>
          <span className="eyebrow">Mari terhubung</span>
          <h2 className="h-sec">Ada momen yang ingin dirayakan?</h2>
          <p style={{ margin: '24px 0 28px', maxWidth: 420 }}>Tanyakan pilihan produk, tanggal kebutuhan, atau diskusikan ide tart Anda. Percakapan dimulai melalui WhatsApp, tanpa checkout di website.</p>
          {wa
            ? <a className="btn btn-solid" href={wa} target="_blank" rel="noreferrer">Chat via WhatsApp <span>↗</span></a>
            : <button className="btn btn-solid" disabled>Chat via WhatsApp <span>↗</span></button>}
          {!wa && <p className="small" style={{ marginTop: 14 }}>Nomor WhatsApp belum diberikan, tombol belum terhubung.</p>}
        </div>
        <div className="contact-rows">
          <div><b>Alamat usaha</b>{empty(s.address, 'Alamat lengkap usaha')}</div>
          <div><b>Jam operasional</b>{empty(s.hours, 'Hari dan jam operasional')}</div>
          <div><b>WhatsApp</b>{empty(s.whatsapp, 'Nomor WhatsApp usaha')}</div>
          <div><b>Media sosial</b>Instagram: {empty(s.instagram, 'akun usaha')}<br />Facebook: {empty(s.facebook, 'halaman usaha')}</div>
        </div>
      </div></section>

      <section className="section"><div className="container">
        <div className="sec-head" style={{ marginBottom: 24 }}><h2 className="h-sec">Temukan Sahabat Cake.</h2>{!s.address && <span className="pill" style={{ margin: 0 }}>Lokasi belum ditentukan</span>}</div>
        <div className="map"><div style={{ fontSize: 28 }}>⌖</div><h3>Area Google Maps</h3>
          <p className="small" style={{ marginTop: 8 }}>{s.address || 'Peta akan ditampilkan setelah alamat usaha diisi pemilik.'}</p></div>
      </div></section>
    </>
  );
}
