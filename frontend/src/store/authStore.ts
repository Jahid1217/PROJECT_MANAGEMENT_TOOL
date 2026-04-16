import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  role: 'PROJECT_MANAGER' | 'DEVELOPER' | 'QA' | 'USER' | 'MOBILE_APP_DEVELOPER' | 'ADMIN';
  fullName: string;
  profilePicture?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const normalizeUser = (user: User | null): User | null => {
  if (!user) {
    return null;
  }

  const fallbackName = user.email?.split('@')[0] || 'User';
  return {
    ...user,
    fullName: user.fullName?.trim() || fallbackName,
  };
};

const storedUser = normalizeUser(JSON.parse(localStorage.getItem('user') || 'null'));
if (storedUser) {
  localStorage.setItem('user', JSON.stringify(storedUser));
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    const normalizedUser = normalizeUser(user);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', token);
    set({ user: normalizedUser, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
