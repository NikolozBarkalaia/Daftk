import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const { token } = JSON.parse(userInfo);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      localStorage.removeItem('userInfo');
    }
  }
  return config;
});

// Interceptor to handle 401 – clear stale session and redirect to admin login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminPath = window.location.pathname.startsWith('/admin');
      if (isAdminPath && !window.location.pathname.endsWith('/login')) {
        localStorage.removeItem('userInfo');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Returns a usable image/video URL whether the stored value is a relative
// upload path (/uploads/...) or an already-absolute external URL.
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url;
};

// ─── Order API ───────────────────────────────────────────────
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrderByToken = (token) => api.get(`/orders/t/${token}`);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getAllOrders = () => api.get('/orders');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// ─── Guest order lookup (OTP) ────────────────────────────────
export const requestOrderLookup = (email) => api.post('/orders/request-lookup', { email });
export const verifyOrderLookup = (email, code) => api.post('/orders/verify-lookup', { email, code });
