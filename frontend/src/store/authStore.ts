import { create } from 'zustand';
import type { User } from '../types';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  initialize: () => {
    const token = localStorage.getItem('fruitbd_token');
    const userStr = localStorage.getItem('fruitbd_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token });
      } catch {
        localStorage.removeItem('fruitbd_token');
        localStorage.removeItem('fruitbd_user');
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;
      localStorage.setItem('fruitbd_token', token);
      localStorage.setItem('fruitbd_user', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', data);
      const { user, token } = res.data.data;
      localStorage.setItem('fruitbd_token', token);
      localStorage.setItem('fruitbd_user', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('fruitbd_token');
    localStorage.removeItem('fruitbd_user');
    set({ user: null, token: null });
  },

  updateProfile: async (data) => {
    const res = await api.patch('/auth/profile', data);
    const updatedUser = res.data.data;
    localStorage.setItem('fruitbd_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));
