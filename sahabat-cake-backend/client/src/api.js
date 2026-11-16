// Pembungkus fetch ke API Express
const TOKEN_KEY = 'sc_admin_token';
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY));

async function request(path, { method = 'GET', body, admin } = {}) {
  const headers = {};
  const isForm = body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  if (admin) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(path, { method, headers, body: body && (isForm ? body : JSON.stringify(body)) });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && admin) setToken(null);
    throw Object.assign(new Error(data.message || 'Terjadi kesalahan'), { status: res.status });
  }
  return data;
}

export const api = {
  products: (category) => request(`/api/products${category ? `?category=${category}` : ''}`),
  gallery: () => request('/api/gallery'),
  settings: () => request('/api/settings'),
  customRequest: (form) => request('/api/custom-requests', { method: 'POST', body: form }),
  order: (body) => request('/api/orders', { method: 'POST', body }),
  login: (password) => request('/api/admin/login', { method: 'POST', body: { password } }),
  admin: {
    summary: () => request('/api/admin/summary', { admin: true }),
    orders: () => request('/api/admin/orders', { admin: true }),
    updateOrder: (id, body) => request(`/api/admin/orders/${id}`, { method: 'PATCH', body, admin: true }),
    saveProduct: (id, form) => request(id ? `/api/admin/products/${id}` : '/api/admin/products', { method: id ? 'PUT' : 'POST', body: form, admin: true }),
    deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE', admin: true }),
    saveSettings: (body) => request('/api/admin/settings', { method: 'PUT', body, admin: true }),
    addGallery: (form) => request('/api/admin/gallery', { method: 'POST', body: form, admin: true }),
    deleteGallery: (id) => request(`/api/admin/gallery/${id}`, { method: 'DELETE', admin: true }),
  },
};
