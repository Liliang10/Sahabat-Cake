export const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
export const img = (name) => (name ? `/uploads/${name}` : '');
export const tanggal = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
export const statusLabel = { menunggu: 'Menunggu persetujuan', dikonfirmasi: 'Dikonfirmasi', ditolak: 'Ditolak' };

// Tautan WhatsApp. Jika nomor belum diisi, kembalikan null.
export function waLink(number, text) {
  const n = String(number || '').replace(/\D/g, '').replace(/^0/, '62');
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}
export const stockLabel = (p) => (p.category === 'tart' ? p.stock : `Stok ${p.stock} ${p.unit}`);
