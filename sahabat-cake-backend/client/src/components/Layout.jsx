import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from './Settings.jsx';
import { waLink } from '../utils.js';

const links = [
  ['/', 'Beranda'], ['/tentang-kami', 'Tentang Kami'], ['/katalog-tart', 'Katalog Tart'],
  ['/custom-tart', 'Custom Tart'], ['/kue-basah', 'Kue Basah'], ['/galeri-kontak', 'Galeri & Kontak'],
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { settings: s } = useSettings();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  const wa = waLink(s.whatsapp, 'Halo SAHABAT CAKE, saya ingin bertanya tentang tart dan kue basah.');
  const placeholder = (v, label) => v || `[${label} perlu diisi]`;

  return (
    <>
      <header className="site-header">
        <div className="nav">
          <Link to="/" className="logo">Sahabat Cake<small>TART & KUE BASAH</small></Link>
          <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}><span /><span /><span /></button>
          <nav className={'nav-links' + (open ? ' open' : '')}>
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
            ))}
            {wa
              ? <a className="btn btn-solid btn-sm" href={wa} target="_blank" rel="noreferrer">WhatsApp <span>↗</span></a>
              : <Link className="btn btn-solid btn-sm" to="/galeri-kontak">WhatsApp <span>↗</span></Link>}
          </nav>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="footer">
        <div className="cols">
          <div>
            <div className="logo">Sahabat Cake</div>
            <p style={{ fontSize: 14 }}>Teman manis untuk setiap cerita.<br />Tart personal, kue basah yang akrab.</p>
          </div>
          <div>
            <h4>Jelajahi</h4>
            <ul>
              <li><Link to="/tentang-kami">Tentang Kami</Link></li>
              <li><Link to="/katalog-tart">Katalog Tart</Link></li>
              <li><Link to="/custom-tart">Custom Tart</Link></li>
              <li><Link to="/kue-basah">Katalog Kue Basah</Link></li>
            </ul>
          </div>
          <div>
            <h4>Mari terhubung</h4>
            <ul>
              <li>WhatsApp: {placeholder(s.whatsapp, 'nomor')}</li>
              <li>Instagram: {placeholder(s.instagram, 'akun')}</li>
              <li>Alamat: {placeholder(s.address, 'alamat usaha')}</li>
              <li>Jam operasional: {placeholder(s.hours, 'jam')}</li>
            </ul>
          </div>
        </div>
        <div className="legal">SAHABAT CAKE · Konsep desain. Produk, harga, stok, pesanan dan testimoni adalah contoh. · <Link to="/admin">Admin</Link></div>
      </footer>
    </>
  );
}
