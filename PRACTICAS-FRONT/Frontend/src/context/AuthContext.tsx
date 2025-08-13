import React, { createContext } from 'react';

export type User = {
  id: number;
  nombre: string;
  correo: string;
  esAdmin?: boolean;
  esNomina?: boolean;
  esJefe?: boolean;
  tiendaNombre?: string | null;
  roles?: string[];
};

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  // defaults seguros; se reemplazan en el Provider
  login: async () => {
    throw new Error('AuthContext.login no inicializado');
  },
  logout: async () => {
    throw new Error('AuthContext.logout no inicializado');
  },
});