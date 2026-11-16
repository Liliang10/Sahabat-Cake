import { bad } from './errors.js';

export function text(v, label, { max = 200, required = false } = {}) {
  const s = v == null ? '' : String(v).trim();
  if (required && !s) throw bad(`${label} wajib diisi`);
  if (s.length > max) throw bad(`${label} maksimal ${max} karakter`);
  return s;
}

export function integer(v, label, { min = 0, max = 1e9, required = true } = {}) {
  if (v == null || String(v).trim() === '') {
    if (required) throw bad(`${label} wajib diisi`);
    return null;
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw bad(`${label} harus bilangan bulat ${min}–${max}`);
  return n;
}

// Harga bebas ketik ("Rp 250.000") → 250000; kosong → null
export function rupiah(v, label = 'Harga') {
  if (v == null || String(v).trim() === '') return null;
  const digits = String(v).replace(/\D/g, '');
  if (!digits) throw bad(`${label} tidak valid`);
  const n = Number(digits);
  if (n > 1e9) throw bad(`${label} terlalu besar`);
  return n;
}

export function isoDate(v, label = 'Tanggal', { notPast = true } = {}) {
  const s = String(v || '').trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (!d || d.toISOString().slice(0, 10) !== s) throw bad(`${label} tidak valid (format YYYY-MM-DD)`);
  if (notPast) {
    const limit = Date.now() - 36 * 3600 * 1000; // toleransi zona waktu
    if (d.getTime() < limit - (limit % 86400000)) throw bad(`${label} tidak boleh di masa lalu`);
  }
  return s;
}

export function oneOf(v, allowed, label) {
  if (!allowed.includes(v)) throw bad(`${label} harus salah satu dari: ${allowed.join(', ')}`);
  return v;
}
