import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Franco from '../../assets/images/Franco_saluda.png';
import Trabajadores from '../../assets/images/Trabajadores.png';
import Logo_Home from '../../assets/logos/Logo_home.png';

import ErrorAlert from '../../components/Alerts/ErrorAlert';
import LoginForm from '../../components/Form_Login/LoginForm';
import { useAuth } from '../../context/useAuth';
import { adminLogin } from '../../services/authService'; // ← usa el endpoint /auth/admin-login

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailLogin = async (email: string) => {
    try {
      const userData = await adminLogin(email); // { user, token }

      setUser(userData.user);

      if (userData.user.esAdmin) {
        navigate('/dashboard-administrador');
      } else if (userData.user.esNomina) {
        navigate('/dashboard-nomina');
      } else if (userData.user.esJefe) {
        navigate('/dashboard-jefe');
      } else {
        setErrorMsg('Tu rol no tiene una vista asignada. Contacta al soporte.');
        setTimeout(() => setErrorMsg(''), 5000);
      }
    } catch (err) {
      console.error('Error en login ADMIN:', err);
      setErrorMsg('Error al iniciar sesión. Intenta nuevamente.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-gray-200 overflow-hidden">
      {/* Mensaje flotante de error */}
      {errorMsg && <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />}

      {/* Fondo / imágenes */}
      <div className="absolute inset-0 z-0">
        {/* Logo superior centrado */}
        <img
          src={Logo_Home}
          alt="Logo Homecenter"
          className="absolute top-5 left-1/2 -translate-x-1/2 w-[150px] object-contain"
        />

        {/* Franco a la izquierda */}
        <img
          src={Franco}
          alt="Franco"
          className="absolute left-[-140px] top-1/2 -translate-y-1/2 w-[500px] object-contain"
        />

        {/* Trabajadores a la derecha */}
        <img
          src={Trabajadores}
          alt="Trabajadores"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[375px] object-contain"
        />
      </div>

      {/* Contenedor central (tarjeta) */}
      <div className="font-poppins relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-[#4669AF] p-10 rounded-3xl text-center space-y-6 shadow-2xl transition duration-300 hover:scale-105 w-full max-w-lg">
          <h2 className="text-xl font-bold text-white">
            Bienvenido(a), aquí podrás gestionar tus diferentes solicitudes de Post - Nómina
          </h2>

          {/* Formulario (solo correo) */}
          <LoginForm onEmailLogin={handleEmailLogin} />

          <div className="space-y-3 text-white text-sm">
            <p className="font-bold">
              ¿Tienes dudas del portal? <br />
              <span className="font-normal cursor-pointer hover:underline hover:text-yellow-200 transition">
                Resuélvelas aquí
              </span>
            </p>
            <p className="font-bold">
              ¿No logras ingresar? <br />
              <span className="font-normal cursor-pointer hover:underline hover:text-yellow-200 transition">
                Crear caso con soporte SODI
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;