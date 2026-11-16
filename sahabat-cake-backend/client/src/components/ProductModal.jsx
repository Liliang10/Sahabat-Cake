import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useSettings } from './Settings.jsx';
import { rupiah, img, waLink } from '../utils.js';

export default function ProductModal({ p, onClose }) {
  const { settings } = useSettings();
  const [f, setF] = useState({ nama: '', jumlah: p.category === 'tart' ? 1 : 10, tanggal: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  const tpl = settings.waTemplate || 'Halo SAHABAT CAKE, saya ingin memesan {produk} sebanyak {jumlah} untuk tanggal {tanggal}. Atas nama {nama}.';
  const text = tpl
    .replace('{produk}', p.name)
    .replace('{jumlah}', `${f.jumlah} ${p.unit}`)
    .replace('{tanggal}', f.tanggal || '[tanggal]')
    .replace('{nama}', f.nama || '[nama]');
  const link = waLink(settings.whatsapp, text);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!f.nama.trim() || !f.tanggal || +f.jumlah < 1) return setErr('Lengkapi nama, jumlah, dan tanggal kebutuhan.');
    try {
      const o = await api.order({ nama: f.nama, productId: p.id, jumlah: f.jumlah, tanggal: f.tanggal });
      setDone(o);
      if (link) window.open(link, '_blank');
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <img className="mi" src={img(p.image)} alt={p.name} />
        <div className="mb">
          <button className="x" onClick={onClose} aria-label="Tutup">×</button>
          <span className="eyebrow">{p.category === 'tart' ? 'Tart' : 'Kue basah'} · {p.size}</span>
          <h3>{p.name}</h3>
          <p style={{ fontSize: 14 }}>{p.description}</p>
          <p style={{ margin: '14px 0 4px', fontWeight: 500 }}>{rupiah(p.price)} / {p.unit} · {p.flavor}</p>
          {done ? (
            <div className="ok-box">
              Pesanan <b>{done.id}</b> tercatat dengan status <b>menunggu konfirmasi</b>.
              {!link && <p className="small" style={{ marginTop: 8 }}>Nomor WhatsApp belum diisi pemilik, jadi chat belum bisa dibuka. Pesan Anda sudah tersimpan.</p>}
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="field"><label>Nama pelanggan *</label><input value={f.nama} onChange={set('nama')} placeholder="Nama Anda" /></div>
              <div className="row2">
                <div className="field"><label>Jumlah ({p.unit}) *</label><input type="number" min="1" value={f.jumlah} onChange={set('jumlah')} /></div>
                <div className="field"><label>Tanggal kebutuhan *</label><input type="date" value={f.tanggal} onChange={set('tanggal')} /></div>
              </div>
              {err && <div className="error">{err}</div>}
              <div className="actions"><button className="btn btn-solid" type="submit">Pesan via WhatsApp <span>↗</span></button></div>
              <p className="small" style={{ marginTop: 12 }}>Ketersediaan dikonfirmasi penjual. Pesanan belum otomatis diterima.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
