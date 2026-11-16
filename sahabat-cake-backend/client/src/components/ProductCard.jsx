import { rupiah, img, stockLabel } from '../utils.js';

export default function ProductCard({ p, onOpen }) {
  return (
    <article className="card">
      <div className="ph"><img src={img(p.image)} alt={p.name} loading="lazy" /></div>
      <div className="meta"><b>{p.category === 'tart' ? 'Tart' : 'Kue basah'}</b><span>{stockLabel(p)}</span></div>
      <h3>{p.name}</h3>
      <div className="sub">{p.size} · {p.flavor}</div>
      <div className="price">{rupiah(p.price)} / {p.unit}</div>
      <div className="acts">
        <button className="l" onClick={() => onOpen(p)}>Lihat detail</button>
        <button className="btn btn-line btn-sm" onClick={() => onOpen(p)}>Pesan <span>↗</span></button>
      </div>
    </article>
  );
}
