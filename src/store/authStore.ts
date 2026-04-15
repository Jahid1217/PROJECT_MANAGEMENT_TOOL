import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  role: 'PROJECT_MANAGER' | 'DEVELOPER' | 'QA' | 'USER' | 'MOBILE_APP_DEVELOPER' | 'ADMIN';
  full_name: string;
  profile_picture?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
