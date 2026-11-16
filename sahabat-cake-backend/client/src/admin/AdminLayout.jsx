import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { api, getToken, setToken } from '../api.js';

function Login({ onOk }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  async function go(e) {
    e.preventDefault();
    try { const { token } = await api.login(pw); setToken(token); onOk(); }
    catch (ex) { setErr(ex.message); }
  }
  return (
    <div className="login">
      <form className="panel" onSubmit={go}>
        <span className="eyebrow">Ruang kelola</span>
        <h2>Masuk admin</h2>
        <div className="field"><label>Kata sandi</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></div>
        {err && <div className="error">{err}</div>}
        <div className="actions"><button className="btn btn-solid" type="submit">Masuk <span>↗</span></button><Link className="btn btn-line" to="/">Kembali</Link></div>
      </form>
    </div>
  );
}

export default function AdminLayout() {
  const [authed, setAuthed] = useState(!!getToken());
  const logout = () => { setToken(null); setAuthed(false); };
  if (!authed) return <Login onOk={() => setAuthed(true)} />;
  const nav = [['/admin', 'Ringkasan', true], ['/admin/produk', 'Produk'], ['/admin/pengaturan', 'Pengaturan & Pesanan']];
  return (
    <div className="admin">
      <aside className="side">
        <div className="logo">Sahabat Cake<small>Ruang kelola</small></div>
        <nav>{nav.map(([to, l, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>{l}</NavLink>)}</nav>
        <hr />
        <Link className="link" to="/" target="_blank">↗ Lihat website publik</Link>
        <button className="link" onClick={logout}>Keluar</button>
      </aside>
      <div className="main"><Outlet context={{ logout }} /></div>
    </div>
  );
}

export function Crumb({ label }) {
  return <div className="crumb"><span className="eyebrow">Workspace / {label}</span><span className="badge">Admin</span></div>;
}
