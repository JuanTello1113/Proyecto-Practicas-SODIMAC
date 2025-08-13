// PRACTICAS-FRONT/Frontend/src/context/AuthProvider.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { AuthContext, type User } from './AuthContext';
import SplashScreen from '../components/Loading/SplashScreen';

const API_URL =
  import.meta.env.VITE_API_URL ??
  `${location.protocol}//${location.hostname}:3000`;

type Props = { children: React.ReactNode };

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ⬇️ control del splash
  const [hydrated, setHydrated] = useState(false);
  const [splashTimeOver, setSplashTimeOver] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSplashTimeOver(true), 3000); // 3s mínimos
    return () => clearTimeout(t);
  }, []);
  const splashVisible = !(hydrated && splashTimeOver); // visible hasta que ambas sean true

  // hidratar sesión al montar
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' });
        if (res.ok) {
          const data = (await res.json()) as { user: User };
          if (!cancelled) setUser(data.user);
        } else {
          if (!cancelled) setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHydrated(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = async (email: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`login falló (${res.status})`);

    const me = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' });
    if (!me.ok) throw new Error(`profile falló (${me.status})`);
    const data = (await me.json()) as { user: User };
    setUser(data.user);
    return data.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Splash arriba de todo con fade suave */}
      <SplashScreen visible={splashVisible} />
    </AuthContext.Provider>
  );
}