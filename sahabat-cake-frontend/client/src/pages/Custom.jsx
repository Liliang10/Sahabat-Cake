import { useMemo, useRef, useState } from 'react';
import { api } from '../api.js';
import { useSettings } from '../components/Settings.jsx';
import { waLink } from '../utils.js';

const opt = {
  tema: ['Floral Garden', 'Minimal Floral', 'Ocean', 'Rustic Bloom', 'Elegant Ivory'],
  warna: ['Biru muda & ivory', 'Putih & hijau sage', 'Pink pastel', 'Ivory & emas', 'Cokelat & krem'],
  ukuran: ['Ø 16 cm', 'Ø 18 cm', 'Ø 20 cm'],
  rasa: ['Vanila', 'Cokelat', 'Red velvet', 'Stroberi'],
};
const fields = ['nama', 'tema', 'warna', 'ukuran', 'rasa', 'tulisan', 'jumlah', 'tanggal'];
const faqs = [
  ['Apakah semua ide bisa dibuat?', 'Tidak selalu. Penjual akan meninjau tingkat kerumitan desain, ukuran, dan jadwal sebelum menyetujui.'],
  ['Apakah harga langsung pasti?', 'Belum. Harga final dibicarakan setelah desain disepakati, bukan dihitung otomatis oleh website.'],
  ['Bisa custom kue basah?', 'Tidak. Custom hanya tersedia untuk tart. Kue basah hanya dapat dipesan sesuai katalog.'],
];

export default function Custom() {
  const { settings } = useSettings();
  const [f, setF] = useState({ nama: '', tema: opt.tema[0], warna: opt.warna[0], ukuran: opt.ukuran[0], rasa: opt.rasa[0], tulisan: '', jumlah: '1', tanggal: '', catatan: '' });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const inp = useRef();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const tgl = f.tanggal ? new Date(f.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '[tanggal]';
  const message = useMemo(() => [
    'Halo SAHABAT CAKE, saya ingin mengajukan custom tart.', '',
    `Nama: ${f.nama || '[nama]'}`, `Produk: Custom Tart · tema ${f.tema}`, `Warna: ${f.warna}`, `Ukuran: ${f.ukuran}`,
    `Rasa: ${f.rasa}`, `Tulisan: ${f.tulisan || '[tulisan]'}`, `Jumlah: ${f.jumlah} kue`, `Tanggal: ${tgl}`,
    `Catatan: ${f.catatan || '-'}`, `Referensi: ${file ? '1 foto dilampirkan terpisah.' : 'tidak ada.'}`,
  ].join('\n'), [f, file, tgl]);
  const link = waLink(settings.whatsapp, message);

  function pick(e) {
    const x = e.target.files[0];
    if (!x) return;
    if (x.size > 5 * 1024 * 1024 || !/image\/(jpeg|png)/.test(x.type)) { setErrors(['referensi']); return; }
    setErrors([]); setFile(x);
  }

  async function submit(e) {
    e.preventDefault();
    const missing = fields.filter((k) => !String(f[k]).trim());
    if (missing.length) return setErrors(missing);
    setErrors([]); setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('referensi', file);
      const r = await api.customRequest(fd);
      setDone(r);
      if (link) window.open(link, '_blank');
    } catch (ex) { setErrors(['server:' + ex.message]); }
    setBusy(false);
  }

  const bad = (k) => errors.includes(k);
  const Sel = ({ k, label }) => (
    <div className="field"><label>{label} *</label>
      <select value={f[k]} onChange={set(k)}>{opt[k].map((o) => <option key={o}>{o}</option>)}</select></div>
  );

  return (
    <>
      <section className="container" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <span className="eyebrow">Custom tart / Khusus kue tart</span>
        <h1 className="h-page">Ide Anda, dalam sepotong perayaan.</h1>
        <p className="lead">Ceritakan tema, warna dan detail kecil yang berarti. Kami bantu memulai percakapan untuk tart yang lebih personal, bukan pemesanan yang langsung diterima.</p>
        <div className="split" style={{ '--cols': '1fr 1.1fr', gap: 40, marginTop: 52 }}>
          <img src="/uploads/custom.jpg" alt="Tart bunga biru" style={{ aspectRatio: '416 / 242' }} />
          <div>
            <span className="eyebrow">Personal, dengan proses yang jelas</span>
            <h2 className="h-sec" style={{ fontSize: 40 }}>Sebuah ide yang indah dimulai dari percakapan.</h2>
            <div style={{ display: 'flex', gap: 36, fontSize: 12, margin: '22px 0' }}><span>01 Isi detail</span><span>02 Diskusi desain</span><span>03 Persetujuan penjual</span></div>
            <p className="small">Custom hanya tersedia untuk tart. Kue basah hanya dapat dipesan sesuai katalog.</p>
          </div>
        </div>
        <div className="info" style={{ marginTop: 44 }}>Permintaan custom belum otomatis diterima. Penjual akan meninjau desain, ketersediaan tanggal dan harga final sebelum memberikan persetujuan.</div>
      </section>

      <section className="container" style={{ paddingBottom: 96 }}>
        <form className="form-grid" onSubmit={submit} noValidate>
          <div className="panel">
            <span className="eyebrow">Detail permintaan</span>
            <h2>Mari kenali tart impian Anda.</h2>
            <p className="small">Kolom bertanda * wajib diisi</p>
            <div className="field"><label>Nama pelanggan *</label><input value={f.nama} onChange={set('nama')} placeholder="Nadia Putri" />{bad('nama') && <div className="error">Nama wajib diisi</div>}</div>
            <div className="row2"><Sel k="tema" label="Tema tart" /><Sel k="warna" label="Warna pilihan" /></div>
            <div className="row2"><Sel k="ukuran" label="Ukuran" /><Sel k="rasa" label="Rasa" /></div>
            <div className="field"><label>Tulisan pada kue *</label><input value={f.tulisan} onChange={set('tulisan')} placeholder="Selamat ulang tahun, Ibu" />{bad('tulisan') && <div className="error">Tulisan wajib diisi (isi “-” jika tanpa tulisan)</div>}</div>
            <div className="row2">
              <div className="field"><label>Jumlah *</label><input type="number" min="1" value={f.jumlah} onChange={set('jumlah')} /></div>
              <div className="field"><label>Tanggal kebutuhan *</label><input type="date" value={f.tanggal} onChange={set('tanggal')} />{bad('tanggal') && <div className="error">Pilih tanggal kebutuhan</div>}</div>
            </div>
            <div className="field"><label>Catatan tambahan</label><textarea value={f.catatan} onChange={set('catatan')} placeholder="Bunga buttercream yang sederhana." /></div>
            <div className="field">
              <label>Upload referensi desain</label>
              <label className="drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick({ target: { files: e.dataTransfer.files } }); }}>
                <div style={{ fontSize: 22 }}>⇪</div>Pilih foto atau letakkan referensi di sini
                <small>JPG / PNG · Maks. 5 MB</small>
                <input ref={inp} type="file" accept="image/jpeg,image/png" hidden onChange={pick} />
              </label>
              {bad('referensi') && <div className="error">File harus JPG/PNG dan maksimal 5 MB.</div>}
              {file && <div className="filebar"><span>{file.name} · {(file.size / 1048576).toFixed(1)} MB</span><button type="button" onClick={() => { setFile(null); inp.current.value = ''; }}>Hapus</button></div>}
            </div>
          </div>

          <aside>
            <div className="preview">
              <span className="eyebrow">Preview pesan WhatsApp</span>
              <h3>Ceritakan tart impian Anda.</h3>
              <div className="msg">{message}</div>
              <p className="small preview-note">Permintaan belum diterima otomatis. Desain, jadwal dan harga final menunggu persetujuan penjual.</p>
              <p className="small preview-note">Harga final dibicarakan setelah penjual meninjau kompleksitas desain, ukuran, rasa dan tanggal. Permintaan baru menjadi pesanan setelah detail dan harga disepakati.</p>
              {!link && !done && <p className="small preview-note">Nomor WhatsApp belum diisi, tetapi permintaan tetap dapat disimpan.</p>}
              {done
                ? <div style={{ background: 'rgba(255,255,255,.15)', padding: 16, fontSize: 13 }}>Permintaan <b>{done.id}</b> terkirim · menunggu persetujuan penjual.{!link && ' Nomor WhatsApp belum diisi pemilik, tetapi permintaan Anda sudah tersimpan.'}</div>
                : <button className="btn btn-white" type="submit" disabled={busy}>{busy ? 'Mengirim…' : 'Ajukan via WhatsApp ↗'}</button>}
              {errors.find((x) => x.startsWith('server:')) && <div className="error" style={{ color: '#ffd5d0' }}>{errors.find((x) => x.startsWith('server:')).slice(7)}</div>}
            </div>
          </aside>
        </form>
      </section>

      <section className="mint section"><div className="container">
        <span className="eyebrow">Sebelum mengajukan</span>
        <h2 className="h-sec" style={{ marginBottom: 44 }}>Beberapa hal yang perlu diketahui.</h2>
        <div className="steps" style={{ gap: 40 }}>
          {faqs.map(([q, a]) => <div key={q} style={{ border: 0, padding: 0 }}><h3 style={{ fontSize: 28, margin: '0 0 12px' }}>{q}</h3><p>{a}</p></div>)}
        </div>
      </div></section>
    </>
  );
}
