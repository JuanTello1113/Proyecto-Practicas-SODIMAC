import http from './http';

// Login ADMIN por correo
export async function adminLogin(email: string) {
  const { data } = await http.post('/auth/admin-login', { email });
  return data; // { message: 'ok', user }
}

// Perfil con cookie
export async function getProfile() {
  const { data } = await http.get('/auth/profile');
  return data; // { user }
}

// Logout
export async function doLogout() {
  await http.post('/auth/logout', {});
}