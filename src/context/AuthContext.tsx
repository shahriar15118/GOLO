import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

import { auth, googleProvider, facebookProvider, twitterProvider } from '../lib/firebase';
import { signInWithPopup, AuthProvider as FirebaseAuthProvider } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: any, token: string) => void;
  logout: () => void;
  signInWithSocial: (providerName: 'google' | 'facebook' | 'twitter') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('golo_token');
    const storedUser = localStorage.getItem('golo_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem('golo_token', token);
    localStorage.setItem('golo_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('golo_token');
    localStorage.removeItem('golo_user');
  };

  const signInWithSocial = async (providerName: 'google' | 'facebook' | 'twitter') => {
    let provider: FirebaseAuthProvider;
    if (providerName === 'google') provider = googleProvider;
    else if (providerName === 'facebook') provider = facebookProvider;
    else provider = twitterProvider;

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Exchange with our backend
      const res = await api.post('/auth/firebase-login', { idToken });
      login(res.data.user, res.data.token);
    } catch (err) {
      console.error('Social login failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signInWithSocial }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
