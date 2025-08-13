import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext, AuthContextType, User } from './AuthContext';
import SplashScreen from '../components/Loading/SplashScreen';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  // Control del splash inicial
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
  const MIN_SPLASH_MS = 3000; 
  const start = Date.now();

  const checkSession = async () => {
    try {
      const { data } = await axios.get('/auth/profile', { withCredentials: true });
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      const spent = Date.now() - start;
      const left  = Math.max(0, MIN_SPLASH_MS - spent);
      setTimeout(() => setSplashVisible(false), left);
    }
  };

  checkSession();
}, []);


  const login = async (email: string) => {
    await axios.post('/auth/admin-login', { email }, { withCredentials: true, timeout: 5000 });
    const { data } = await axios.get<{ user: User }>('/auth/profile', {
      withCredentials: true,
      timeout: 5000,
    });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true, timeout: 5000 });
    } finally {
      setUser(null);
    }
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    login,
    logout,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {/* Muestra el overlay mientras está visible */}
      {splashVisible && (
        <SplashScreen
          visible={true}
          onFinish={() => setSplashVisible(false)} // por si tu componente dispara onFinish
        />
      )}
      {children}
    </AuthContext.Provider>
  );
};