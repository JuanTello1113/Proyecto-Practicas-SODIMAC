import axios from 'axios';
import { Ban, Edit, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
axios.defaults.withCredentials = true;

interface UsuarioGestion {
  id_usuario: number;                     // <<<< CLAVE
  nombre: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  ultima_actividad: string | null;
  ip_ultima_conexion: string | null;
  ubicacion: string | null;
}

const GestionUser: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioGestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState('Todos');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get(`${API}/usuario/listar`);
        setUsuarios(res.data);
        // console.log('Ejemplo item:', res.data?.[0]);
      } catch (error) {
        console.error('Error al traer usuarios:', error);
      }
    };
    fetchUsuarios();
  }, []);

  const rolesUnicos = ['Todos', ...Array.from(new Set(usuarios.map((u) => u.rol)))];

  const usuariosFiltrados = usuarios.filter((user) => {
    const q = searchTerm.toLowerCase();
    const coincideBusqueda =
      user.nombre.toLowerCase().includes(q) ||
      user.ip_ultima_conexion?.toLowerCase().includes(q) ||
      user.ubicacion?.toLowerCase().includes(q);
    const coincideRol = rolSeleccionado === 'Todos' || user.rol === rolSeleccionado;
    return coincideBusqueda && coincideRol;
  });

  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => a.nombre.localeCompare(b.nombre));

  const obtenerPermisosPorRol = (rol: string): string => {
    const r = rol.toLowerCase();
    if (r.includes('admin')) return 'Gestionar usuarios';
    if (r.includes('nomin')) return 'Revisión de novedades y respuesta, junto con exportación de archivos';
    if (r.includes('tienda')) return 'Cargue de novedades y exportación de archivos';
    return 'Sin permisos asignados';
    };

  // --------- HANDLERS ---------
  const onEdit = async (user: UsuarioGestion) => {
    const nuevoNombre = prompt('Nuevo nombre', user.nombre);
    if (nuevoNombre == null || nuevoNombre === user.nombre) return;
    try {
      setLoadingId(user.id_usuario);
      await axios.patch(`${API}/usuario/${user.id_usuario}`, { nombre: nuevoNombre });
      setUsuarios(prev => prev.map(u => (u.id_usuario === user.id_usuario ? { ...u, nombre: nuevoNombre } : u)));
    } catch (e: any) {
      alert(`Error al editar: ${e?.response?.data ?? e?.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const onToggle = async (user: UsuarioGestion) => {
    const activar = user.estado !== 'Activo';
    if (!confirm(`${activar ? 'Activar' : 'Desactivar'} a ${user.nombre}?`)) return;
    try {
      setLoadingId(user.id_usuario);
      await axios.patch(`${API}/usuario/${user.id_usuario}/estado`, { activo: activar });
      setUsuarios(prev => prev.map(u => (u.id_usuario === user.id_usuario ? { ...u, estado: activar ? 'Activo' : 'Inactivo' } : u)));
    } catch (e: any) {
      alert(`Error al cambiar estado: ${e?.response?.data ?? e?.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const onDelete = async (user: UsuarioGestion) => {
    if (!confirm(`Eliminar a ${user.nombre}? Esta acción es permanente.`)) return;
    try {
      setLoadingId(user.id_usuario);
      await axios.delete(`${API}/usuario/${user.id_usuario}`);
      setUsuarios(prev => prev.filter(u => u.id_usuario !== user.id_usuario));
    } catch (e: any) {
      alert(`Error al eliminar: ${e?.response?.data ?? e?.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white relative">
      <Navbar />

      <main className="flex-grow px-4 pt-16 pb-10 bg-gray-100">
        <div className="bg-white px-8 py-6 rounded-xl w-full max-w-6xl mx-auto shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)] transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">GESTIÓN DE USUARIOS</h1>
            <span className="text-sm text-gray-600">Total: {usuariosFiltrados.length}</span>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, IP o ubicación..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4669AF] focus:border-transparent bg-white text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              title="rol"
              value={rolSeleccionado}
              onChange={(e) => setRolSeleccionado(e.target.value)}
              className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4669AF] bg-white text-black"
            >
              {rolesUnicos.map((rol) => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          <div className="overflow-y-auto max-h-[300px] w-full rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Última Actividad</th>
                  <th className="px-6 py-3">IP/Ubicación</th>
                  <th className="px-6 py-3">Permisos</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosOrdenados.map((user, idx) => {
                  const deshabilitado = loadingId === user.id_usuario;
                  return (
                    <tr key={`${user.id_usuario}-${idx}`} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#e8effc] transition-all`}>
                      <td className="px-6 py-4 font-medium text-gray-800">{user.nombre}</td>
                      <td className="px-6 py-4 text-gray-700">{user.rol}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.ultima_actividad ? new Date(user.ultima_actividad).toLocaleString('es-CO') : 'Sin registro'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.ip_ultima_conexion === '::1' && user.ubicacion === 'Ubicación desconocida'
                          ? 'localhost / Bogotá, Colombia'
                          : `${user.ip_ultima_conexion || '—'} / ${user.ubicacion || '—'}`}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{obtenerPermisosPorRol(user.rol)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button type="button" onClick={() => onEdit(user)} disabled={deshabilitado} className="bg-[#4669AF] hover:bg-[#3a5a9b] disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs flex items-center space-x-1">
                            <Edit className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button type="button" onClick={() => onToggle(user)} disabled={deshabilitado} className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs flex items-center space-x-1">
                            <Ban className="w-3 h-3" />
                            <span>{user.estado === 'Activo' ? 'Desactivar' : 'Activar'}</span>
                          </button>
                          <button type="button" onClick={() => onDelete(user)} disabled={deshabilitado} className="bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs flex items-center space-x-1">
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <p className="text-lg">No se encontraron usuarios</p>
                <p className="text-sm mt-1">Intenta con otros criterios de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GestionUser;
