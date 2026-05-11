import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Returns a usable image/video URL whether the stored value is a relative
// upload path (/uploads/...) or an already-absolute external URL.
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5001${url}`;
};

// ─── Order API ───────────────────────────────────────────────
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getMyOrders = () => api.get('/orders/myorders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getAllOrders = () => api.get('/orders');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
