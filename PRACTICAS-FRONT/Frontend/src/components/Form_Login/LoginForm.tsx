// PRACTICAS-FRONT/Frontend/src/components/Form_Login/LoginForm.tsx
import React, { useEffect, useRef, useState } from 'react';

import logo from '../../assets/logos/Logo_home.png';
import franco from '../../assets/images/Franco_saluda.png';
import workers from '../../assets/images/Trabajadores.png';

type Props = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (ev?: React.FormEvent) => void;
  submitting?: boolean;
  error?: string | null;
};

const LoginForm: React.FC<Props> = ({
  email,
  onEmailChange,
  onSubmit,
  submitting = false,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <div className="min-h-screen w-full bg-[#e9ecf2] overflow-x-clip">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-center justify-center">
          <img src={logo} alt="Homecenter" className="h-12 w-auto select-none" draggable={false} />
        </div>

        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
          {/* Franco */}
          <div className="hidden md:flex justify-center overflow-hidden">
            <img
              src={franco}
              alt="Franco"
              className="max-h-[480px] max-w-full h-auto select-none object-contain drop-shadow-md"
              draggable={false}
            />
          </div>

          {/* Card central */}
          <div className="col-span-1">
            <div className="rounded-2xl bg-[#4C6CB3] px-6 py-8 text-white shadow-xl">
              <h1 className="text-center text-xl font-extrabold leading-7">
                Bienvenido(a), aquí podrás gestionar tus
                <br />
                diferentes solicitudes de Post – Nómina
              </h1>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="w-full rounded-full bg-white/30 px-6 py-3 text-sm font-bold tracking-wide backdrop-blur-sm transition hover:bg-white/40 md:w-[420px] shadow"
                  disabled={submitting}
                >
                  {submitting ? 'Ingresando…' : 'Iniciar sesión con correo corporativo'}
                </button>
              </div>

              <div className="mt-8 space-y-4 text-center text-sm">
                <div>
                  <span className="font-semibold">¿Tienes dudas del portal?</span>{' '}
                  <a href="#" className="underline underline-offset-4 hover:text-white/90">
                    Resuélvelas aquí
                  </a>
                </div>
                <div>
                  <span className="font-semibold">¿No logras ingresar?</span>{' '}
                  <a href="#" className="underline underline-offset-4 hover:text-white/90">
                    Crear caso con soporte SODI
                  </a>
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-auto mt-4 rounded-xl border border-red-200 bg-white px-4 py-3 text-[#2b3a55] shadow md:w-[420px]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Equipo */}
          <div className="hidden md:flex justify-center overflow-hidden">
            <img
              src={workers}
              alt="Equipo Homecenter"
              className="max-h-[480px] max-w-full h-auto select-none object-contain drop-shadow-md"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Modal correo */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-bold text-[#2b3a55]">Iniciar sesión con correo corporativo</h2>
              <p className="mt-1 text-sm text-[#50607f]">Ingresa tu correo @homecenter.co para continuar.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(e);
              }}
              className="px-6 pt-5 pb-4"
            >
              <label className="mb-1 block text-sm font-medium text-[#2b3a55]">Correo corporativo</label>
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="usuario@homecenter.co"
                required
                className="w-full rounded-lg border border-[#cdd6e6] bg-white px-3 py-2 text-black outline-none transition focus:border-[#4C6CB3] focus:ring-2 focus:ring-[#4C6CB3]"
              />

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-[#2b3a55] transition hover:bg-[#eef2f9]"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#4C6CB3] px-4 py-2 font-semibold text-white transition hover:bg-[#3f5a94] disabled:opacity-70"
                  disabled={submitting}
                >
                  {submitting ? 'Ingresando…' : 'Continuar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;