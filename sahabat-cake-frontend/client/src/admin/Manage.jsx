import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api.js';
import { useSettings } from '../components/Settings.jsx';
import { Crumb } from './AdminLayout.jsx';
import { Badge } from './Summary.jsx';
import { tanggal, img } from '../utils.js';

const kinds = { tart: 'Tart katalog', 'kue-basah': 'Kue basah', custom: 'Custom tart' };

function Orders({ logout }) {
  const [orders, setOrders] = useState([]);
  const [sel, setSel] = useState(null);
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const load = () => api.admin.orders().then((o) => {
    setOrders(o);
    setSel((s) => o.find((x) => x.id === s?.id) || o[0]);
    setError('');
  }).catch((ex) => {
    if (ex.status === 401) logout();
    setError(ex.message);
  });
  useEffect(() => { load(); }, []);
  useEffect(() => setPrice(sel?.finalPrice || ''), [sel?.id]);
  const waiting = orders.filter((o) => o.status === 'menunggu').length;
  const update = (status) => api.admin.updateOrder(sel.id, { status, finalPrice: price }).then(load).catch((ex) => {
    if (ex.status === 401) logout();
    setError(ex.message);
  });

  return (
    <>
      <div className="sec-head" style={{ marginBottom: 20 }}><h2 className="h-sec" style={{ fontSize: 40 }}>Pesanan & persetujuan</h2><span className="badge">{waiting} menunggu · {orders.length - waiting} diproses</span></div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="box" style={{ overflowX: 'auto' }}>
        <table><thead><tr><th>Pesanan</th><th>Pelanggan</th><th>Produk / kategori</th><th>Tanggal</th><th>Status</th></tr></thead>
          <tbody>{orders.map((o) => (
            <tr key={o.id} className={'click' + (sel?.id === o.id ? ' sel' : '')} onClick={() => setSel(o)}>
              <td>{o.id}</td><td>{o.customer}</td><td>{o.item}<div className="small">{kinds[o.type]}</div></td><td>{tanggal(o.date)}</td><td><Badge s={o.status} /></td>
            </tr>))}</tbody></table>
      </div>
      {sel && (
        <div className="cards2" style={{ '--cols': '1fr 1fr', marginTop: 20 }}>
          <div className="box">
            <span className="eyebrow">Detail {sel.id} / {kinds[sel.type]}</span>
            <h2>{sel.customer} · {sel.item.split('· ').pop()}</h2>
            <div style={{ marginTop: 14, lineHeight: 1.9, fontSize: 13.5 }}>
              {sel.detail
                ? Object.entries(sel.detail).filter(([, v]) => v).map(([k, v]) => <div key={k}><span style={{ textTransform: 'capitalize' }}>{k}</span>: {k === 'referensi' ? <a className="link" href={img(v)} target="_blank" rel="noreferrer">Lihat foto ↗</a> : v}</div>)
                : <div>Produk: {sel.item}<br />Tanggal: {tanggal(sel.date)}</div>}
            </div>
          </div>
          <div className="mint-box">
            <span className="badge ok">{sel.status === 'menunggu' ? 'Menunggu persetujuan penjual' : sel.status === 'dikonfirmasi' ? 'Dikonfirmasi' : 'Ditolak'}</span>
            <h3>Tinjau dahulu,<br />baru konfirmasikan.</h3>
            <div className="field" style={{ marginTop: 0 }}><label>Harga final (Rp)</label><input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Diisi setelah desain disepakati" /></div>
            <div className="actions">
              <button className="btn btn-solid" onClick={() => update('dikonfirmasi')}>Konfirmasi <span>↗</span></button>
              <button className="btn btn-line" onClick={() => update('ditolak')}>Tolak</button>
              {sel.status !== 'menunggu' && <button className="btn btn-line" onClick={() => update('menunggu')}>Kembalikan ke menunggu</button>}
            </div>
            <p className="small" style={{ marginTop: 14 }}>Status tidak mengirim notifikasi otomatis. Hubungi pelanggan lewat WhatsApp.</p>
          </div>
        </div>
      )}
    </>
  );
}

function GalleryAdmin({ logout }) {
  const [items, setItems] = useState([]);
  const [f, setF] = useState({ title: '', caption: '', group: 'tart' });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api.gallery().then((gallery) => {
    setItems(gallery);
    setErr('');
  }).catch((ex) => setErr(ex.message));
  useEffect(() => { load(); }, []);
  async function remove(id) {
    try {
      await api.admin.deleteGallery(id);
      load();
    } catch (ex) {
      if (ex.status === 401) logout();
      setErr(ex.message);
    }
  }
  async function add(e) {
    e.preventDefault(); setErr('');
    const fd = new FormData(); Object.entries(f).forEach(([k, v]) => fd.append(k, v)); if (file) fd.append('image', file);
    try { await api.admin.addGallery(fd); setFile(null); setF({ title: '', caption: '', group: 'tart' }); load(); }
    catch (ex) { ex.status === 401 ? logout() : setErr(ex.message); }
  }
  return (
    <>
      <h2 className="h-sec" style={{ fontSize: 40, marginBottom: 20 }}>Galeri</h2>
      <form className="box" onSubmit={add}>
        <div className="row2"><div className="field" style={{ marginTop: 0 }}><label>Judul</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div className="field" style={{ marginTop: 0 }}><label>Keterangan</label><input value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} /></div></div>
        <div className="row2"><div className="field"><label>Kelompok</label><select value={f.group} onChange={(e) => setF({ ...f, group: e.target.value })}><option value="tart">Tart perayaan</option><option value="kue-basah">Kue basah</option></select></div>
          <div className="field"><label>Foto (JPG/PNG, maks. 5 MB)</label><input type="file" accept="image/jpeg,image/png" onChange={(e) => setFile(e.target.files[0])} /></div></div>
        {err && <div className="error">{err}</div>}
        <div className="actions"><button className="btn btn-solid" type="submit">Tambah ke galeri <span>↗</span></button></div>
      </form>
      <div className="gal-admin">{items.map((g) => (
        <div key={g.id}><img src={img(g.image)} alt={g.title} /><div className="sec-head" style={{ margin: '8px 0 0', alignItems: 'center' }}><span>{g.title}</span>
          <button className="link" style={{ background: 'none', border: 0 }} onClick={() => confirm('Hapus foto ini?') && remove(g.id)}>Hapus</button></div></div>))}</div>
    </>
  );
}

function Form({ keys, title, logout, area }) {
  const { settings, reload } = useSettings();
  const [v, setV] = useState({});
  const [msg, setMsg] = useState('');
  useEffect(() => setV(Object.fromEntries(keys.map(([k]) => [k, settings[k] || '']))), [settings]);
  async function save(e) {
    e.preventDefault();
    try { await api.admin.saveSettings(v); await reload(); setMsg('Tersimpan.'); } catch (ex) { ex.status === 401 ? logout() : setMsg(ex.message); }
  }
  return (
    <>
      <h2 className="h-sec" style={{ fontSize: 40, marginBottom: 20 }}>{title}</h2>
      <form className="box" onSubmit={save} style={{ maxWidth: 720 }}>
        {keys.map(([k, l, ph]) => (
          <div className="field" key={k} style={{ marginTop: 0, marginBottom: 20 }}><label>{l}</label>
            {area ? <textarea style={{ minHeight: 130 }} value={v[k] || ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} /> : <input value={v[k] || ''} placeholder={ph} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}</div>))}
        {area && <p className="small">Variabel: {'{produk}'}, {'{jumlah}'}, {'{tanggal}'}, {'{nama}'}</p>}
        <div className="actions"><button className="btn btn-solid" type="submit">Simpan <span>↗</span></button></div>
        {msg && <p className="small" style={{ marginTop: 10 }}>{msg}</p>}
      </form>
    </>
  );
}

export default function Manage() {
  const { logout } = useOutletContext();
  const [tab, setTab] = useState('pesanan');
  const tabs = [['pesanan', 'Pesanan'], ['galeri', 'Galeri'], ['info', 'Informasi usaha'], ['wa', 'Template WhatsApp']];
  return (
    <>
      <Crumb label="Pengaturan & Pesanan" />
      <h1 className="h-page" style={{ fontSize: 56 }}>Pengaturan & pesanan</h1>
      <p style={{ marginTop: 10 }}>Tinjau permintaan custom, rapikan galeri dan siapkan informasi usaha.</p>
      <div className="admin-tabs">{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === 'pesanan' && <Orders logout={logout} />}
      {tab === 'galeri' && <GalleryAdmin logout={logout} />}
      {tab === 'info' && <Form title="Informasi usaha" logout={logout} keys={[[ 'whatsapp', 'Nomor WhatsApp', '6285954531100'], ['instagram', 'Instagram', '@sahabatcake'], ['facebook', 'Facebook', 'Halaman usaha'], ['address', 'Alamat usaha', ''], ['hours', 'Jam operasional', 'Senin–Sabtu, 08.00–17.00']]} />}
      {tab === 'wa' && <Form area title="Template WhatsApp" logout={logout} keys={[['waTemplate', 'Template pesan pesanan']]} />}
    </>
  );
}
