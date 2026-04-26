import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend-url.onrender.com/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sbs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sbs_token');
      localStorage.removeItem('sbs_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;