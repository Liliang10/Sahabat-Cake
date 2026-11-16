export const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
export const img = (name) => (name ? `/uploads/${name}` : '');
export function productWaMessage(p, order = {}) {
  const kind = p.category === 'tart' ? 'tart' : 'kue basah';
  const template = order.template || '';
  const intro = template
    ? template
      .replace('{produk}', p.name)
      .replace('{jumlah}', `${order.quantity ?? 1} ${p.unit}`)
      .replace('{tanggal}', order.date || '[tanggal]')
      .replace('{nama}', order.name || '[nama]')
    : `Halo SAHABAT CAKE, saya ingin memesan ${kind} *${p.name}*.`;
  const lines = [
    intro,
    `Ukuran: ${p.size || '-'}`,
    `Rasa: ${p.flavor || '-'}`,
    `Harga: ${rupiah(p.price)} / ${p.unit}`,
  ];
  if (order.quantity !== undefined && !template.includes('{jumlah}')) lines.push(`Jumlah: ${order.quantity} ${p.unit}`);
  if (order.date && !template.includes('{tanggal}')) lines.push(`Tanggal: ${order.date}`);
  if (order.name && !template.includes('{nama}')) lines.push(`Atas nama: ${order.name}`);
  lines.push('Mohon info ketersediaan dan jadwal pre-order. Terima kasih.');
  return lines.join('\n');
}
export function formatWhatsapp(number) {
  const digits = String(number || '').replace(/\D/g, '');
  if (!digits) return '';
  const local = digits.startsWith('62') ? `0${digits.slice(2)}` : digits;
  return local.replace(/^(\d{4})(\d{4})(\d+)$/, '$1-$2-$3');
}
export const tanggal = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
export const statusLabel = { menunggu: 'Menunggu persetujuan', dikonfirmasi: 'Dikonfirmasi', ditolak: 'Ditolak' };

// Tautan WhatsApp. Jika nomor belum diisi, kembalikan null.
export function waLink(number, text) {
  const n = String(number || '').replace(/\D/g, '').replace(/^0/, '62');
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}
export const stockLabel = (p) => (p.category === 'tart' ? p.stock : `Stok ${p.stock} ${p.unit}`);
