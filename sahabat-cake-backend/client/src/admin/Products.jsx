import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api.js';
import { Crumb } from './AdminLayout.jsx';
import { rupiah, img, stockLabel } from '../utils.js';

const blank = { id: null, name: '', category: 'tart', price: '', stock: 'Pre-order', size: '', flavor: '', description: '', image: '' };

export default function Products() {
  const { logout } = useOutletContext();
  const [list, setList] = useState([]);
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => api.products().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);
  const rows = list.filter((p) => (cat === 'all' || p.category === cat) && (p.name + p.category).toLowerCase().includes(q.toLowerCase()));
  const set = (k) => (e) => setSel({ ...sel, [k]: e.target.value });
  const count = (c) => list.filter((p) => p.category === c).length;

  async function save(e) {
    e.preventDefault(); setMsg('');
    const fd = new FormData();
    ['name', 'category', 'price', 'stock', 'size', 'flavor', 'description'].forEach((k) => fd.append(k, sel[k]));
    if (file) fd.append('image', file);
    try {
      const p = await api.admin.saveProduct(sel.id, fd);
      setSel(p); setFile(null); setMsg('Tersimpan.'); load();
    } catch (ex) { ex.status === 401 ? logout() : setMsg(ex.message); }
  }
  async function remove() {
    if (!confirm(`Hapus ${sel.name}?`)) return;
    await api.admin.deleteProduct(sel.id).catch(() => {});
    setSel(null); load();
  }

  return (
    <>
      <Crumb label="Produk" />
      <h1 className="h-page" style={{ fontSize: 56 }}>Kelola produk</h1>
      <p style={{ marginTop: 10 }}>Satu katalog untuk website publik. Atur foto, informasi tart, harga dan stok kue basah.</p>
      <div className="filters" style={{ margin: '26px 0 0' }}>
        <div className="tabs" style={{ margin: 0 }}>
          {[['all', `Semua · ${list.length}`], ['tart', `Tart · ${count('tart')}`], ['kue-basah', `Kue basah · ${count('kue-basah')}`]].map(([k, l]) => <button key={k} className={cat === k ? 'on' : ''} onClick={() => setCat(k)}>{l}</button>)}
        </div>
        <button className="btn btn-solid" onClick={() => { setSel({ ...blank }); setFile(null); setMsg(''); }}>Tambah produk <span>↗</span></button>
      </div>
      <div className="prod-grid">
        <div className="box">
          <input className="search" placeholder="Cari nama produk atau kategori…" value={q} onChange={(e) => setQ(e.target.value)} />
          <table><thead><tr><th>Foto</th><th>Nama produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Aksi</th></tr></thead>
            <tbody>{rows.map((p) => (
              <tr key={p.id} className={'click' + (sel?.id === p.id ? ' sel' : '')} onClick={() => { setSel({ ...p }); setFile(null); setMsg(''); }}>
                <td><img className="thumb" src={img(p.image)} alt="" /></td>
                <td><b style={{ fontWeight: 500 }}>{p.name}</b><div className="small">{p.size} · {p.flavor}</div></td>
                <td>{p.category === 'tart' ? 'Tart' : 'Kue basah'}</td>
                <td>{rupiah(p.price)}<div className="small">/ {p.unit}</div></td>
                <td>{p.category === 'tart' ? p.stock : `${p.stock} buah`}</td>
                <td>Edit ↗</td>
              </tr>))}</tbody></table>
        </div>
        {sel && (
          <form className="box" onSubmit={save}>
            <div className="sec-head" style={{ marginBottom: 12 }}><h2>{sel.id ? 'Edit produk' : 'Produk baru'}</h2><button type="button" className="link" style={{ background: 'none', border: 0, fontSize: 22 }} onClick={() => setSel(null)}>×</button></div>
            {(file || sel.image) && <img src={file ? URL.createObjectURL(file) : img(sel.image)} alt="" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />}
            <label className="link" style={{ margin: '10px 0', cursor: 'pointer' }}>Ganti foto ↗<input type="file" accept="image/jpeg,image/png" hidden onChange={(e) => setFile(e.target.files[0])} /></label><span className="small"> JPG / PNG · maks. 5 MB</span>
            <div className="field"><label>Nama produk</label><input value={sel.name} onChange={set('name')} required /></div>
            <div className="field"><label>Kategori</label><select value={sel.category} onChange={set('category')}><option value="tart">Tart</option><option value="kue-basah">Kue basah</option></select></div>
            <div className="field"><label>Harga (Rp) / {sel.category === 'tart' ? 'kue' : 'buah'}</label><input type="number" min="0" value={sel.price} onChange={set('price')} /></div>
            <div className="field"><label>{sel.category === 'tart' ? 'Ketersediaan' : 'Stok (buah)'}</label><input value={sel.stock} onChange={set('stock')} type={sel.category === 'tart' ? 'text' : 'number'} /></div>
            <div className="row2"><div className="field"><label>Ukuran</label><input value={sel.size} onChange={set('size')} /></div><div className="field"><label>Rasa</label><input value={sel.flavor} onChange={set('flavor')} /></div></div>
            <div className="field"><label>Deskripsi</label><textarea value={sel.description} onChange={set('description')} /></div>
            <div className="actions"><button className="btn btn-solid" type="submit">Simpan <span>↗</span></button>{sel.id && <button type="button" className="btn btn-line" onClick={remove}>Hapus</button>}</div>
            {msg && <p className="small" style={{ marginTop: 10 }}>{msg}</p>}
          </form>
        )}
      </div>
    </>
  );
}
