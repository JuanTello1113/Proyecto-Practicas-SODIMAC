// PRACTICAS-FRONT/Frontend/src/context/AuthContext.tsx
import { createContext } from 'react';

export type User = {
  id: number;
  nombre: string;
  correo: string;
  esAdmin: boolean;
  esNomina: boolean;
  esJefe: boolean;
  roles?: string[];
  tiendaNombre?: string | null;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<User>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);