// PRACTICAS-FRONT/Frontend/src/pages/Login/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import FormLogin from '../../components/Form_Login/LoginForm';

export default function LoginPage() {
  console.log('[LoginPage] build v8');

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleEmailLogin = async (ev?: React.FormEvent) => {
    ev?.preventDefault?.();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(email);
      if (user.esAdmin)       navigate('/dashboard-administrador', { replace: true });
      else if (user.esNomina) navigate('/dashboard-nomina',       { replace: true });
      else if (user.esJefe)   navigate('/dashboard-jefe',         { replace: true });
      else                    navigate('/unauthorized',            { replace: true });
    } catch (err) {
      console.error('Error en login ADMIN:', err);
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormLogin
      email={email}
      onEmailChange={setEmail}
      onSubmit={handleEmailLogin}
      submitting={submitting}
      error={error}
    />
  );
}