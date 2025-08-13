// PRACTICAS-FRONT/Frontend/src/context/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx; // { user, loading, login, logout }
}
export default useAuth;
