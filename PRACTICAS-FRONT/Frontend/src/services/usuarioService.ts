import http from './http';

export type RolUsuario = 'ADMIN' | 'NOMINA' | 'JEFE';

export interface NuevoUsuario {
  nombre: string;
  correo: string;
  rol: RolUsuario;
  esJefe?: boolean;
  tienda?: number | null;
}

export interface UsuarioUpdate {
  nombre?: string;
  correo?: string;
  rol?: RolUsuario;
  esJefe?: boolean;
  tienda?: number | null;
}

export async function crearUsuario(payload: NuevoUsuario) {
  // Si tu backend usa plural, cambia '/usuario' por '/usuarios'
  const { data } = await http.post('/usuario', payload);
  return data;
}

export async function listarUsuarios(params?: { page?: number; pageSize?: number; q?: string }) {
  const { data } = await http.get('/usuario', { params });
  return data;
}

export async function actualizarUsuario(id: number, payload: UsuarioUpdate) {
  const { data } = await http.put(`/usuario/${id}`, payload);
  return data;
}

export async function eliminarUsuario(id: number) {
  const { data } = await http.delete(`/usuario/${id}`);
  return data;
}