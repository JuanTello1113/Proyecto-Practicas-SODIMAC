import axios from 'axios';
import { Ban, Edit, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Footer from '../../components/Footer/Footer';
import Navbar from '../../components/Navbar/Navbar';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
// Asegura que axios envíe la cookie JWT
axios.defaults.withCredentials = true;

interface UsuarioGestion {
  // Ajusta estos dos campos según lo que devuelva tu backend:
  id_usuario?: number;   // ← si tu API usa este nombre
  id?: number;           // ← o este (fallback)

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

  // helper para obtener el id que use tu API
  const getUserId = (u: UsuarioGestion) =>
    (u as any).id_usuario ?? (u as any).id;

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await axios.get(`${API}/usuario/listar`);
        setUsuarios(res.data);
        // console.log('Ejemplo item:', res.data?.[0]); // útil para confirmar nombres de campos
      } catch (error) {
        console.error('Error al traer usuarios:', error);
      }
    };
    fetchUsuarios();
  }, []);

  // Extraer roles únicos para el dropdown
  const rolesUnicos = [
    'Todos',
    ...Array.from(new Set(usuarios.map((u) => u.rol))),
  ];

  const usuariosFiltrados = usuarios.filter((user) => {
    const coincideBusqueda =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ip_ultima_conexion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase());

    const coincideRol =
      rolSeleccionado === 'Todos' || user.rol === rolSeleccionado;

    return coincideBusqueda && coincideRol;
  });

  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );

  const obtenerPermisosPorRol = (rol: string): string => {
    const rolLower = rol.toLowerCase();
    if (rolLower.includes('admin')) return 'Gestionar usuarios';
    if (rolLower.includes('nomin')) return 'Revisión de novedades y respuesta, junto con exportación de archivos';
    if (rolLower.includes('tienda')) return 'Cargue de novedades y exportación de archivos';
    return 'Sin permisos asignados';
  };

  // --------- HANDLERS ---------
  const onEdit = async (user: UsuarioGestion) => {
    const id = getUserId(user);
    if (!id) return alert('No se encontró el ID del usuario.');
    const nuevoNombre = prompt('Nuevo nombre', user.nombre);
    if (nuevoNombre == null || nuevoNombre === user.nombre) return;

    try {
      setLoadingId(id);
      await axios.patch(`${API}/usuario/${id}`, { nombre: nuevoNombre });
      setUsuarios(prev =>
        prev.map(u => (getUserId(u) === id ? { ...u, nombre: nuevoNombre } : u)),
      );
    } catch (e: any) {
      alert(`Error al editar: ${e?.response?.data ?? e?.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const onToggle = async (user: UsuarioGestion) => {
    const id = getUserId(user);
    if (!id) return alert('No se encontró el ID del usuario.');
    const vaActivar = user.estado !== 'Activo';
    if (!confirm(`${vaActivar ? 'Activar' : 'Desactivar'} a ${user.nombre}?`)) return;

    try {
      setLoadingId(id);
      await axios.patch(`${API}/usuario/${id}/estado`, { activo: vaActivar });
      setUsuarios(prev =>
        prev.map(u =>
          getUserId(u) === id ? { ...u, estado: vaActivar ? 'Activo' : 'Inactivo' } : u,
        ),
      );
    } catch (e: any) {
      alert(`Error al cambiar estado: ${e?.response?.data ?? e?.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const onDelete = async (user: UsuarioGestion) => {
    const id = getUserId(user);
    if (!id) return alert('No se encontró el ID del usuario.');
    if (!confirm(`Eliminar a ${user.nombre}? Esta acción es permanente.`)) return;

    try {
      setLoadingId(id);
      await axios.delete(`${API}/usuario/${id}`);
      setUsuarios(prev => prev.filter(u => getUserId(u) !== id));
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
        <div
          className="bg-white px-8 py-6 rounded-xl w-full max-w-6xl mx-auto 
          shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
          hover:shadow-[0_6px_18px_rgba(0,0,0,0.15)] 
          transform hover:scale-[1.01] transition-all duration-300 ease-in-out"
        >
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
                  const id = getUserId(user);
                  const deshabilitado = loadingId === id;

                  return (
                    <tr
                      key={`${id ?? user.nombre}-${idx}`}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#e8effc] transition-all`}
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">{user.nombre}</td>
                      <td className="px-6 py-4 text-gray-700">{user.rol}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.estado === 'Activo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.ultima_actividad
                          ? new Date(user.ultima_actividad).toLocaleString('es-CO')
                          : 'Sin registro'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.ip_ultima_conexion === '::1' && user.ubicacion === 'Ubicación desconocida'
                          ? 'localhost / Bogotá, Colombia'
                          : `${user.ip_ultima_conexion || '—'} / ${user.ubicacion || '—'}`}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {obtenerPermisosPorRol(user.rol)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => onEdit(user)}
                            disabled={deshabilitado}
                            className="bg-[#4669AF] hover:bg-[#3a5a9b] disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggle(user)}
                            disabled={deshabilitado}
                            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                          >
                            <Ban className="w-3 h-3" />
                            <span>{user.estado === 'Activo' ? 'Desactivar' : 'Activar'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); onDelete(user); }}
                            disabled={deshabilitado}
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs flex items-center space-x-1"
                          >
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