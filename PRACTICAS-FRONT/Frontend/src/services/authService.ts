import axios from 'axios';

axios.defaults.withCredentials = true;

const API_URL = import.meta.env.VITE_API_URL as string;

// (si más adelante vuelves a usar Google, este queda listo)
export const loginWithGoogle = async (idToken: string) => {
  const { data } = await axios.post(`${API_URL}/auth/google`, { token: idToken });
  return data; // { user, token }
};

// ← Login por correo (ADMIN)
export const adminLogin = async (email: string) => {
  const { data } = await axios.post(`${API_URL}/auth/admin-login`, { email });
  return data; // { user, token }
};