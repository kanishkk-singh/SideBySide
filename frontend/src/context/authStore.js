import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('sbs_user') || 'null'),
  token: localStorage.getItem('sbs_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('sbs_token', data.token);
      localStorage.setItem('sbs_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return { ok: false, error: msg };
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      localStorage.setItem('sbs_token', data.token);
      localStorage.setItem('sbs_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      return { ok: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('sbs_token');
    localStorage.removeItem('sbs_user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
