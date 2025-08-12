import React, { useState } from 'react';

type Props = {
  onEmailLogin: (email: string) => void | Promise<void>;
};

const LoginForm: React.FC<Props> = ({ onEmailLogin }) => {
  const [email, setEmail] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onEmailLogin(email.trim());
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="correo@empresa.com"
  className="
    w-full px-4 py-3 rounded-xl border border-gray-300
    bg-white text-black placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500
  "
  required
/>


      <p className="text-white/90 text-xs">Ingresa tu correo corporativo.</p>

      <button
        type="submit"
        className="w-full h-12 rounded-full bg-white text-[#334155] font-semibold shadow hover:shadow-md active:scale-[0.99] transition"
      >
        Iniciar sesión con correo corporativo
      </button>
    </form>
  );
};

export default LoginForm;