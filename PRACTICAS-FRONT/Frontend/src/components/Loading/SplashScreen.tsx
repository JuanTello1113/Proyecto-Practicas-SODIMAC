// PRACTICAS-FRONT/Frontend/src/components/Loading/SplashScreen.tsx
import React from 'react';
import logo from '../../assets/logos/Logo_home.png';

type Props = { visible: boolean };

export default function SplashScreen({ visible }: Props) {
  return (
    <div
      className={[
        'fixed inset-0 z-[9999] flex items-center justify-center',
        'bg-[#4C6CB3] text-white',
        'transition-opacity duration-700',
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <div className="text-center px-6">
        <h1 className="text-3xl md:text-5xl font-extrabold">Nómina - Homecenter</h1>
        <div className="mx-auto my-4 h-[3px] w-48 bg-white/90 rounded-full" />
        <img
          src={logo}
          alt="Homecenter"
          className="mx-auto mt-6 h-14 w-auto select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
