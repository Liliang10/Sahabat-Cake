import { useSettings } from './Settings.jsx';
import { rupiah, img, stockLabel, waLink, productWaMessage } from '../utils.js';

export default function ProductCard({ p, onOpen }) {
  const { settings } = useSettings();
  const orderLink = waLink(settings.whatsapp, productWaMessage(p));

  return (
    <article className="card">
      <div className="ph"><img src={img(p.image)} alt={p.name} loading="lazy" /></div>
      <div className="meta"><b>{p.category === 'tart' ? 'Tart' : 'Kue basah'}</b><span>{stockLabel(p)}</span></div>
      <h3>{p.name}</h3>
      <div className="sub">{p.size} · {p.flavor}</div>
      <div className="price">{rupiah(p.price)} / {p.unit}</div>
      <div className="acts">
        <button className="l" onClick={() => onOpen(p)}>Lihat detail</button>
        <a
          className="btn btn-line btn-sm"
          href={orderLink || undefined}
          target={orderLink ? '_blank' : undefined}
          rel={orderLink ? 'noopener noreferrer' : undefined}
          aria-disabled={!orderLink}
          tabIndex={orderLink ? undefined : -1}
          title={orderLink ? undefined : 'Nomor WhatsApp belum diisi pemilik'}
          onClick={orderLink ? undefined : (e) => e.preventDefault()}
        >
          Pesan <span>↗</span>
        </a>
      </div>
    </article>
  );
}
