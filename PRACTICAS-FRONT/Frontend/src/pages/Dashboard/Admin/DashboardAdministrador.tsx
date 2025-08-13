import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBell,
  FaUserCheck,
  FaUserPlus,
  FaUsers,
  FaUserShield,
} from 'react-icons/fa';

import Franco from '../../../assets/images/Franco_Pensando_1-removebg-preview.png';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import Card from '../../../components/Cards/card';
import FormCrearUsuario from '../../../components/Alerts/AlerFormCrearUser';
import { useAuth } from '../../../context/useAuth';

// ⬇️ nuevo: usamos el servicio que pega a la API (baseURL = VITE_API_URL)
import { crearUsuario } from '../../../services/usuarioService';

type FormCrearUsuarioPayload = {
  nombre: string;
  correo: string;
  rol: string;       // 'ADMIN' | 'NOMINA' | 'JEFE' (según lo que envíe tu modal)
  esJefe: boolean;
  tienda?: number;   // opcional si es jefe
};

const DashboardAdministrador: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleCrearUsuario = async (formData: FormCrearUsuarioPayload) => {
    try {
      setEnviando(true);

      // Normaliza campos
      await crearUsuario({
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim().toLowerCase(),
        rol: formData.rol as any, // tipa si lo prefieres con union type
        esJefe: formData.esJefe,
        tienda: formData.esJefe ? formData.tienda ?? null : null,
      });

      alert('✅ Usuario creado correctamente');
      setMostrarFormulario(false);

      // Si quieres, refresca o navega a listados:
      // navigate('/usuarios-registrados');
    } catch (err: any) {
      // Muestra el mensaje que venga del backend si existe
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Error al crear usuario';
      console.error('❌ Error al crear usuario:', err?.response?.data || err);
      alert(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow px-8 pt-8 pb-4">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-black">
              ¡Bienvenido, {user?.nombre || 'Nombre No disponible'}!
            </h2>
            <p className="text-sm text-gray-600">
              Desde aquí puedes gestionar todos los aspectos del sistema y
              monitorear su rendimiento.
            </p>
          </div>

          <div className="w-1/3 flex justify-center mt-2">
            <h2 className="text-xl font-bold text-black">
              Acciones que puedes realizar
            </h2>
          </div>
        </div>

        <div className="flex justify-between pl-6">
          {/* Columna izquierda */}
          <div className="flex flex-col w-1/3 mt-28 pt-4">
            <div className="flex justify-between mb-4 gap-8">
              <Card
                title="Usuarios Registrados"
                icon={<FaUsers size={80} />}
                iconPosition="top"
                className="h-[150px] w-[250px] rounded-2xl"
                onClick={() => navigate('/usuarios-registrados')}
              />
              <Card
                title="Usuarios Activos"
                icon={<FaUserCheck size={80} />}
                iconPosition="top"
                className="h-[150px] w-[250px] rounded-2xl"
                onClick={() => navigate('/gestionar-usuarios')}
              />
            </div>
          </div>

          {/* Columna central (mascota) */}
          <div className="w-1/3 flex justify-center items-center pl-32">
            <img
              src={Franco}
              alt="Franco"
              className="object-contain max-w-[400px]"
            />
          </div>

          {/* Columna derecha: acciones */}
          <div className="w-1/3 pl-5 flex flex-col space-y-8 items-center">
            <Card
              title="Registrar Usuario"
              icon={<FaUserPlus size={50} />}
              iconPosition="top"
              className="h-30 w-[200px] rounded-2xl"
              onClick={() => setMostrarFormulario(true)}
            />
            <Card
              title="Gestionar Permisos"
              icon={<FaUserShield size={50} />}
              iconPosition="top"
              className="h-30 w-[200px] rounded-2xl"
              onClick={() => navigate('/gestionar-usuarios')}
            />
            <Card
              title="Notificaciones"
              icon={<FaBell size={50} />}
              iconPosition="top"
              className="h-30 w-[200px] rounded-2xl"
              onClick={() => navigate('/notificaciones')}
            />
          </div>
        </div>
      </main>

      <Footer />

      {mostrarFormulario && (
        <FormCrearUsuario
          onClose={() => setMostrarFormulario(false)}
          onCrear={handleCrearUsuario}
          // si tu modal acepta prop "loading", descomenta:
          // loading={enviando}
        />
      )}
    </div>
  );
};

export default DashboardAdministrador;