import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  quickDemoLogin: () => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEFAULT_DEMO_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Alex Rivera',
  email: 'alex.rivera@nexora.ai',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  theme_preference: 'emerald',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nexora_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_DEMO_USER;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexora_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexora_user');
      localStorage.removeItem('nexora_token');
    }
  }, [user]);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      if (res.token) localStorage.setItem('nexora_token', res.token);
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ email, password, full_name: fullName });
      setUser(res.user);
      if (res.token) localStorage.setItem('nexora_token', res.token);
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = () => {
    setUser(DEFAULT_DEMO_USER);
    localStorage.setItem('nexora_token', 'demo-jwt-token-00000000-0000-0000-0000-000000000001');
    closeAuthModal();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const res = await api.updateProfile(data);
      setUser(res.profile);
    } catch {
      setUser(prev => (prev ? { ...prev, ...data } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        login,
        register,
        quickDemoLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
