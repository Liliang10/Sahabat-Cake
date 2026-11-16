import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../api.js';
import { Crumb } from './AdminLayout.jsx';
import { tanggal, statusLabel } from '../utils.js';

export const Badge = ({ s }) => <span className={'badge' + (s === 'dikonfirmasi' ? ' ok' : s === 'ditolak' ? ' no' : '')}>{statusLabel[s]}</span>;
const short = (d) => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

export default function Summary() {
  const { logout } = useOutletContext();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.admin.summary().then(setD).catch((ex) => {
      if (ex.status === 401) logout();
      setError(ex.message);
    });
  }, []);
  if (!d) return error ? <p className="error" role="alert">{error}</p> : <p>Memuat…</p>;
  const max = Math.max(1, ...d.perDay.map((x) => x.count));
  const c = d.composition, tot = Math.max(1, c.tart + c.kueBasah + c.custom);

  return (
    <>
      <Crumb label="Ringkasan" />
      <h1 className="h-page" style={{ fontSize: 56 }}>Ringkasan usaha</h1>
      <p style={{ marginTop: 10 }}>Selamat datang di ruang kelola. Pantau katalog dan permintaan pelanggan dalam satu tampilan.</p>
      <div className="stats">
        {[['Produk katalog', d.products, `${d.tart} tart · ${d.kueBasah} kue basah`],
          ['Pesanan', d.orders, `${d.confirmed} dikonfirmasi · ${d.waiting} menunggu`],
          ['Custom menunggu', d.customWaiting, 'Perlu persetujuan penjual'],
          ['Stok kue basah', d.stockBasah, `Total buah · ${d.kueBasah} produk`]].map(([t, n, s]) => (
          <div className="stat" key={t}><span style={{ fontSize: 13 }}>{t}</span><div className="big">{n}</div><small>{s}</small></div>
        ))}
      </div>
      <div className="cards2">
        <div className="box">
          <h2>Permintaan masuk</h2><span className="small">{d.perDay.length} hari terakhir · {d.orders} pesanan</span>
          <div className="bars">{d.perDay.map((x, i) => (
            <div key={x.date} className={'bar' + (i === d.perDay.length - 1 ? ' last' : '')}>{x.count}<i style={{ height: `${(x.count / max) * 80}%` }} /></div>
          ))}</div>
          <div className="dates">{d.perDay.map((x) => <span key={x.date}>{short(x.date)}</span>)}</div>
        </div>
        <div className="box">
          <h2>Komposisi pesanan</h2>
          <div className="comp">
            <div style={{ flex: c.tart / tot, background: 'var(--blue)' }} /><div style={{ flex: c.kueBasah / tot, background: 'var(--sky)', margin: '0 3px' }} /><div style={{ flex: c.custom / tot, background: 'var(--mint)' }} />
          </div>
          <div className="leg">
            <div><span><i style={{ background: 'var(--blue)' }} />Tart katalog</span><span>{c.tart} pesanan</span></div>
            <div><span><i style={{ background: 'var(--sky)' }} />Kue basah</span><span>{c.kueBasah} pesanan</span></div>
            <div><span><i style={{ background: 'var(--mint)' }} />Custom tart</span><span>{c.custom} permintaan</span></div>
          </div>
          <p className="small">Custom terpisah dari tart katalog. Seluruh permintaan custom menunggu persetujuan.</p>
        </div>
      </div>
      {d.customWaiting > 0 && <div className="info" style={{ margin: '20px 0' }}>{d.customWaiting} permintaan custom tart menunggu peninjauan. Jangan tandai diterima sebelum desain, tanggal dan harga final disepakati dengan pelanggan.</div>}
      <div className="box" style={{ marginTop: 20 }}>
        <div className="sec-head" style={{ marginBottom: 14 }}><h2>Pesanan terbaru</h2><Link to="/admin/pengaturan" className="btn btn-line btn-sm">Kelola pesanan <span>↗</span></Link></div>
        <table><thead><tr><th>Pesanan</th><th>Pelanggan</th><th>Produk</th><th>Tanggal</th><th>Status</th></tr></thead>
          <tbody>{d.latest.map((o) => <tr key={o.id}><td>{o.id}</td><td>{o.customer}</td><td>{o.item}</td><td>{tanggal(o.date)}</td><td><Badge s={o.status} /></td></tr>)}</tbody></table>
        <p className="small" style={{ marginTop: 14 }}>Menampilkan {d.latest.length} dari {d.orders} pesanan. Status tidak mengirim notifikasi otomatis.</p>
      </div>
    </>
  );
}
